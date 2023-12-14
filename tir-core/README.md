# TIR-Core

See also the Readme in the repository root.

This package combines the logic for resolving Trusted Issuer Registries and verifying issuers given an already resolved TIR.

## Generate Models with OpenAPI Generator

In repository root:
`openapi-generator-cli generate -g typescript-angular -i tir-verifier-api.yaml -o tir-core/src/ --global-property models --additional-properties=modelPackage=model,withSeparateModelsAndApi=true,apiPackage=api`
Or use the "updateTirCore.sh" script in the repository root.

## Code formatting

Prettier is used to format all package code.

## Build

After changes, the core package must be rebuilt and reinstalled in the dependent packages (frontend & backend) with `npm i`.

To build the core package: `npm run build`
To build the package automatically after changes: `npm start`

The "updateTirCore.sh" script in the repository root rebuilds the core package and runs `npm i` in the frontend and backend package.
