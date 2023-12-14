/**
 * Logic for Tezos TIR parsing
 */
import { BigMapAbstraction } from '@taquito/taquito'
import { ExpandableTezosTIR } from './model/expandableTezosTIR'
import { Issuer } from './model/issuer'

/**
 * Parses a Tezos TIR from a smart contract storage into the TIR data model
 * @param storage The smart contract storage
 * @param tezosOnlyIssuerIds Whether only issuer IDs should be parsed and the issuers should not be fetched from the Michelson Big-map
 * @returns The parsed TIR
 */
export async function parseTezosTIR(
  storage: any,
  tezosOnlyIssuerIds?: boolean
): Promise<ExpandableTezosTIR> {
  const issuerIds: string[] = storage.issuerIds

  const issuersMichelsonMap = storage.issuers as BigMapAbstraction
  let expandedIssuerIds: string[] = []

  const issuersMap = new Map<string, Issuer>()
  // Fetch all issuers from the Michelson Big-map since they cannot be fetched all at once
  for (const issuerId of issuerIds) {
    // If only issuer IDs should be parsed, only add the issuer ID to the map
    if (tezosOnlyIssuerIds) {
      issuersMap.set(issuerId, {
        id: issuerId
      })
    } else {
      // If the issuer ID should be expanded, fetch the issuer from the Michelson Big-map
      let issuer: any = await issuersMichelsonMap.get(issuerId)
      if (issuer == undefined) {
        throw new Error(
          `Issuer ${issuerId} not found in the TIR although it is referenced in the issuerIds list`
        )
      }
      let newIssuer: Issuer = issuerFromApiResult(issuer)
      issuersMap.set(issuer.id, newIssuer)
      expandedIssuerIds.push(issuer.id)
    }
  }

  const issuers = Object.fromEntries(issuersMap.entries())

  return {
    method: 'TrustedIssuerRegistry2023Tezos',
    methodProtocol: storage.protocolTezos,
    protocol: storage.protocol,
    issuer: storage.issuer,
    lastUpdated: storage.lastUpdated,
    ttl: storage.ttl,
    extraMetadata: JSON.parse(storage.extraMetadata),
    issuers,
    issuerIds,
    owner: storage.owner,
    issuersMichelsonMap: issuersMichelsonMap,
    expandedIssuerIds: expandedIssuerIds
  }
}

// Converts an issuer from the API result format to the issuer data model
export function issuerFromApiResult(issuer: any): Issuer {
  return {
    id: issuer.id,
    trustedSince: issuer.trustedSince?.Some,
    trustedUntil: issuer.trustedUntil?.Some,
    revoked: issuer.revoked?.Some,
    tcDescription: issuer.tcDescription?.Some,
    tcIdentity: issuer.tcIdentity?.Some,
    credentialSchemas: issuer.credentialSchemas?.Some
  }
}

/**
 * Serializes an object containing Maps into a JSON string
 * @param object The object to serialize
 * @param space The number of spaces to use for indentation
 * @returns The serialized JSON string
 */
export function serializeObjectContainingMaps(object: any, space?: number) {
  return JSON.stringify(
    object,
    // Replacer function converting values of type Map to a plain object
    (key: any, value: any) => {
      if (value instanceof Map) {
        // Convert Map to an array of key-value pairs
        return Object.fromEntries(value)
      } else {
        // Preserve all other values as-is
        return value
      }
    },
    space
  )
}
