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
import { CredentialSchema } from './credentialSchema';


/**
 * A trusted issuer inside a Trusted Issuer Registry with all the information about the scope and context of trust in the issuer.
 */
export interface Issuer { 
    /**
     * A unique identifier for the issuer in URI format.
     */
    id: string;
    /**
     * A start date in ISO 8601 format since when the issuer is trusted.
     */
    trustedSince?: string;
    /**
     * An end date in ISO 8601 format until when the issuer is trusted.
     */
    trustedUntil?: string;
    /**
     * Whether the trust in the issuer has been revoked, e.g., because it turned out that the issuer is malicious.
     */
    revoked?: boolean;
    /**
     * A string field that maintainers can use to define the trust in the issuer in natural language. The value enables maintainers to decide for themselves how to balance the trade-off between detailed trust specification and broad delegation of trust.
     */
    tcDescription?: string;
    /**
     * A string field that maintainers can use to connect an issuer with his legal identity. We have refrained from specifying the field in detail, as the requirements vary depending on the application. Maintainers can fill the field with natural language or structured data like a serialized JSON map.
     */
    tcIdentity?: string;
    credentialSchemas?: Array<CredentialSchema>;
}

