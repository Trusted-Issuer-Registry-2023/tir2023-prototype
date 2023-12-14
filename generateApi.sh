#!/bin/bash

# Generate Frontend API
openapi-generator-cli generate -g typescript-axios -i tir-verifier-api.yaml -o frontend/src/api

# Generate Backend Models
openapi-generator-cli generate -g typescript-angular -i tir-verifier-api.yaml -o backend/src/ --global-property models --additional-properties=modelPackage=model,withSeparateModelsAndApi=true,apiPackage=api

# Generate Core Models
openapi-generator-cli generate -g typescript-angular -i tir-verifier-api.yaml -o tir-core/src/ --global-property models --additional-properties=modelPackage=model,withSeparateModelsAndApi=true,apiPackage=api