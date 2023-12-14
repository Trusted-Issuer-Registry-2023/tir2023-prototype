# TIR Verification Backend

See also the Readme in the repository root.

The backend is built using the Express framework and uses Redis as cache. Its primary purpose is to decouple the time-consuming TIR resolution from the time-critical issuer verification. The backend has a CRON job that resolves a predefined TIR at freely adjustable times, for example, midnight.

An .env file is needed for proper operation.
Docker uses the special .env file ".env.docker", needed to define a different host to access Redis.
Example .env file:
```
# Timezone: Important for scheduling a cronjob for TIR resolving at midnight
TZ=Europe/Berlin
CRON_TIME=" */1 * * * *" # Every minute
# CRON_TIME="0 0 * * *" # Every day at midnight

TEZOS_RPC_URL=https://ghostnet.tezos.marigold.dev

# Redis host and port, for Docker: redis, 6379, for local: 0.0.0.0, 6379
REDIS_HOST=redis
REDIS_PORT=6379
# Frontend host, important for CORS
#FRONTEND_HOST=https://example.com
```
An example .env file can also be found at [.env.example](.env.example).

## Generate Models with OpenAPI Generator

In repository root:
`openapi-generator-cli generate -g typescript-angular -i tir-verifier-api.yaml -o backend/src/ --global-property models --additional-properties=modelPackage=model,withSeparateModelsAndApi=true,apiPackage=api`
Or use the "updateTirCore.sh" script in the repository root.

## Code formatting

Prettier is used to format all backend code.
