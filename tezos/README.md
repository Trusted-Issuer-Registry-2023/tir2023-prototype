# Smart Contract for Tezos TIR method

This directory contains the JsLigo code of the smart contract used to deploy a Trusted Issuer Registry on the Tezos blockchain.

See also the Readme in the repository root.

- tir.jsligo: the JsLigo smart contract
- tir.tz: the smart contract compiled to Michelson

## Deploy

Here is an example code to deploy the smart contract using the [Octez client](https://docs.tezos.com/developing/octez-client/installing).
See also: [https://docs.tezos.com/smart-contracts/deploying](https://docs.tezos.com/smart-contracts/deploying)

### Step 1: Compile the contract
`ligo compile contract ./tir.jsligo --protocol nairobi -m TIR -o tir.tz`

### Step 2: Compile the storage and deploy the contract
Don't forget to insert your own Tezos address and issuer id before compiling.

`octez-client originate contract TIR transferring 0 from tz1SVhzNGxbsiEVtUDP2f9WiVpEKkCuHYwTe running tir.tz --init "$(ligo compile storage tir.jsligo 'initialStorage' -m TIR)" --burn-cap 0.7 --force`
