# Frontend "TIR-Connect"

See also the Readme in the repository root.

A Vue web app for managing Trusted Issuer Registries and verifying issuers based on a trusted TIR.

## Usage Info

To use the "backend issuer verification" functionality, the backend must have once resolved and cached a TIR. For this, for example, the backend's CRON job must have run once.

## Development

## .env file

A .env file is required. An example .env file can be found at [.env.example](.env.example).

### Generate API client from OpenAPI

In repository root:
`openapi-generator-cli generate -g typescript-axios -i tir-verifier-api.yaml -o frontend/src/api`
Or use the "updateTirCore.sh" script in the repository root.

### UI Components

The frontend uses the [shadcn-vue component library](https://www.shadcn-vue.com/).

### Code formatting

Prettier is used to format all frontend code.
