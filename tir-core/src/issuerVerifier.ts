/**
 * Logic for verifying issuers given a resolved TIR
 */
import axios from 'axios'
import Validator from 'jsonschema'

import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

import { Issuer } from './model/issuer'
import { IssuerResult } from './model/issuerResult'
import { VerificationResult } from './model/verificationResult'
import { SimpleTIRMap } from './tirResolver'

const jsonSchemaValidator = new Validator.Validator()

// Verifies an issuer given an ID, verification date and a VC
// At least a ID or a VC (from which the ID can be inferred) must be provided
export async function verifyIssuer(
  tir: SimpleTIRMap,
  id?: string,
  verificationDate?: Date,
  vc?: any
): Promise<VerificationResult> {
  // Infer ID and verificationDate from VC if not provided
  if (id == undefined && vc?.issuer != undefined) {
    id = vc.issuer
  }
  if (verificationDate == undefined && vc?.issuanceDate != undefined) {
    verificationDate = new Date(vc.issuanceDate)
  }
  if (id == undefined) {
    throw new Error('No issuer ID provided')
  }

  // Verification

  let overallResult: VerificationResult = {
    valid: false,
    issuerResults: []
  }

  // Retrieve the issuer to verify from the TIR
  let issuer = await tir.get(id)
  // If the issuer is not found, the verification fails
  if (issuer == undefined) {
    overallResult.valid = false
    return overallResult
  }

  // If the issuer was found, verify the trust path, starting from the root (the TIR)
  for (let index = 0; index < issuer.path.length; index++) {
    let pathIssuer = (await tir.get(issuer.path[index]))?.issuer
    let result: IssuerResult = {
      valid: true,
      verifications: [],
      issuer: pathIssuer
    }

    // Check if the issuer was found
    // This should be true, if not it might be a problem with the TIR resolution
    result.verifications.push({ title: 'Issuer Found', valid: pathIssuer != undefined })

    if (pathIssuer != undefined) {
      // Check the issuer's revocation status
      result.verifications.push({
        title: 'Not Revoked',
        valid: pathIssuer.revoked == undefined ? undefined : pathIssuer.revoked == false
      })

      // If a verification date was provided, check if it is within the trustedSince and trustedUntil dates
      if (verificationDate != undefined) {
        let trustDateIsValid: boolean | undefined
        let message: string | undefined
        if (
          pathIssuer.trustedSince != null &&
          verificationDate < new Date(pathIssuer.trustedSince)
        ) {
          trustDateIsValid = false
          message = `Issuance date is before trustedSince date (${verificationDate.toLocaleDateString()} < ${new Date(
            pathIssuer.trustedSince
          ).toLocaleDateString()}).`
        }
        if (
          pathIssuer.trustedUntil != null &&
          verificationDate > new Date(pathIssuer.trustedUntil)
        ) {
          trustDateIsValid = false
          message = `Issuance date is after trustedUntil date (${verificationDate.toLocaleDateString()} > ${new Date(
            pathIssuer.trustedUntil
          ).toLocaleDateString()}).`
        }
        // If there was a verification and it did not fail, trustDate is valid
        if (pathIssuer.trustedSince != null || pathIssuer.trustedUntil != null) {
          trustDateIsValid = trustDateIsValid ?? true
        }
        result.verifications.push({
          title: 'Trust Date',
          valid: trustDateIsValid,
          message: message
        })
      } else {
        result.verifications.push({ title: 'Trust Date', valid: undefined })
      }

      // If a VC was provided, check if it matches the issuer's schemas
      // Don't check a schema for the first trustPathIssuer because this is the TIR which has no schemas specified
      if (vc != undefined && index != 0) {
        const mustBeInheritable = index != issuer!.path.length - 1 // only the last issuer can have a non-inheritable schema
        let schemaRes = await validateSchemaForIssuer(pathIssuer, vc, mustBeInheritable)
        result.verifications.push({
          title: 'Schemas',
          valid: schemaRes.id === undefined ? undefined : schemaRes.id != null,
          message: schemaRes.message
        })
      } else {
        result.verifications.push({ title: 'Schemas', valid: undefined })
      }
    }
    // Calculate the overall result for this issuer
    result.valid = result.verifications.every(v => v.valid != false)
    overallResult.issuerResults.push(result)
  }

  // Calculate the overall result for the verification
  overallResult.valid = overallResult.issuerResults.every(result => result.valid)

  return overallResult
}

// Checks if the issuer has a schema that matches the VC
// Returns for the id:
//  - the schema id if a schema matched
//  - undefined if no schemas are there (assumes full trust)
//  - null if no schema matched (failed verification)
async function validateSchemaForIssuer(
  issuer: Issuer,
  vc: string,
  mustBeInheritable: boolean
): Promise<{ id?: string | null; message?: string }> {
  let errors: string[] = []
  // If the issuer has no schemas, full trust is assumed and we can return here
  if (issuer.credentialSchemas == undefined || issuer.credentialSchemas.length == 0) {
    return { id: undefined, message: 'Issuer has no schemas. Therefore, full trust is assumed.' }
  } else {
    // If the issuer has schemas, check if one of them matches the VC
    for (let schema of issuer.credentialSchemas) {
      if (mustBeInheritable && !schema.inheritable) {
        continue
      }
      console.log('trying schema: ' + schema.id)

      // Currently, only JSON schemas are supported
      if (schema.type.startsWith('JsonSchema')) {
        try {
          // Retrieve the schema from the given URI and check if the hash matches
          let jsonschema = await fetchCredentialSchema(schema.id)
          let calculatedHash = calculateHash(JSON.stringify(jsonschema))
          if (calculatedHash == schema.hash) {
            // If the hash matches, validate the VC against the schema
            let res = jsonSchemaValidator.validate(vc, jsonschema)
            if (res.valid) {
              // If the VC is valid, return the schema ID
              console.log('found matching schema: ' + schema.id)
              return { id: schema.id, message: 'Found: ' + schema.id }
            }
            console.log('schema ' + schema.id + ' did not match')
          } else {
            console.log('hashes did not match')
            console.log('calculated: ' + calculatedHash)
          }
        } catch (e) {
          // Can happen due to network errors or not supported URIs
          errors.push('Schema ID: "' + schema.id + '": ' + (e as any).message)
          continue
        }
      }
    }
  }
  // If no schema matched, return null and the errors
  return {
    id: null,
    message:
      (issuer.credentialSchemas.length == 1
        ? "The issuer's only schema did not match."
        : `Found no matching schema out of ${issuer.credentialSchemas.length} schemas.`) +
      (errors.length > 0
        ? ` Also had errors during schema verification, maybe this is the reason: ${'"' +
            errors.join('", "') +
            '"'}`
        : '')
  }
}

// Retrieves a JSON schema from a given URI
export async function fetchCredentialSchema(id: string): Promise<any> {
  if (id.startsWith('http')) {
    return (await axios(id)).data
  } else {
    throw new Error('Currently, only http(s) schemas are supported.')
  }
}

// Calculates the SHA-256 hash of a string
export function calculateHash(input: string) {
  return bytesToHex(sha256(input))
}
