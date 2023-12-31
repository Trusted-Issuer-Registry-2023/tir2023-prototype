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
import { IssuerResult } from './issuerResult';


/**
 * The result of an issuer verification. Gives the overall result and detailed subresults for every issuer on the trust path.
 */
export interface VerificationResult { 
    /**
     * Whether the issuer is trusted overall.
     */
    valid: boolean;
    issuerResults: Array<IssuerResult>;
}

