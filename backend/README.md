# TIR Verification Backend

See also the Readme in the repository root.

The backend is built using the Express framework and uses Redis as cache. Its primary purpose is to decouple the time-consuming TIR resolution from the time-critical issuer verification. The backend has a CRON job that resolves a predefined TIR at freely adjustable times, for example, midnight.

An .env file is needed for proper operation.
Docker uses the special .env file ".env.docker", needed to define a different host to access Redis.
An example .env file can be found at [.env.example](.env.example).

## Generate Models with OpenAPI Generator

In repository root:
`openapi-generator-cli generate -g typescript-angular -i tir-verifier-api.yaml -o backend/src/ --global-property models --additional-properties=modelPackage=model,withSeparateModelsAndApi=true,apiPackage=api`
Or use the "updateTirCore.sh" script in the repository root.

## Code formatting

Prettier is used to format all backend code.
