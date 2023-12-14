import { TezosToolkit } from "@taquito/taquito";
import { TIRResolver } from "tir-core";
import { issuerRedisClient, redisMapInterface } from "../persistence/redisClient.js";

/**
 * Resolves a complete Trusted Issuer Registry (TIR) based on the provided DID.
 * @param did The DID of the TIR to resolve.
 */
export async function resolveTirRedis(did: string) {
  let resolver = new TIRResolver(
    new TezosToolkit(process.env.TEZOS_RPC_URL ?? "")
  );
  console.log("Flushing Redis");
  await issuerRedisClient.flushDb();
  console.log("Start Resolving TIR");
  await resolver.resolveCompleteTIR(did, redisMapInterface);
  console.log("Done Resolving TIR");
}
