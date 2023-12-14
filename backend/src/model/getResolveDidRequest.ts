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


export interface GetResolveDidRequest { 
    did: string;
    tezosOnlyIssuerIds?: boolean;
    noCache?: boolean;
}

