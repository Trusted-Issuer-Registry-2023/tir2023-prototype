/**
 * TIRVerifier
 * Specifies the models and endpoints used in Trusted Issuer Registry resolution and issuer verification.
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Issuer } from './issuer';
import { VerificationFraction } from './verificationFraction';


export interface VerificationResultIssuerResultsInner { 
    /**
     * Whether the verification for this trust path entity was successfull.
     */
    valid: boolean;
    /**
     * The issuer information of the trust path issuer.
     */
    issuer?: Issuer;
    verifications?: Array<VerificationFraction>;
}

