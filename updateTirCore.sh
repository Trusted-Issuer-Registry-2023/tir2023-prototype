#!/bin/bash

cd tir-core
npm run build

cd ../backend
npm i

cd ../frontend
npm i

echo ""
echo "Done!"
echo "You may need to reload your IDE or language server to remove errors like \"Cannot find module 'tir-core' or its corresponding type declarations.\""