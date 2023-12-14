/**
 * This file contains the implementation of the Redis client for the trusted issuer registry backend.
 * It exports two Redis clients: `issuerRedisClient` and `metadataRedisClient`.
 * It also exports a `mapInterface` object that can be used to plug in Redis to TIR resolution and issuer verification.
 */

import { createClient } from "redis";
import { SimpleTIRMap } from "tir-core";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.REDIS_HOST || "redis";
const port = parseInt(process.env.REDIS_PORT ?? "6379");

/**
 * The Redis client for interacting with the issuer database.
 */
export const issuerRedisClient = await createClient({
  socket: { host: host, port: port },
  database: 0,
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

/**
 * The Redis client for interacting with the metadata database.
 */
export const metadataRedisClient = await createClient({
  socket: { host: host, port: port },
  database: 1,
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

/**
 * A map interface that provides methods for interacting with Redis.
 */
export const redisMapInterface: SimpleTIRMap = {
  /**
   * Sets a key-value pair in Redis.
   * @param key The key to set.
   * @param value The value to set.
   */
  set: async (key, value) => {
    console.log("Setting " + key + " to " + JSON.stringify(value));
    await issuerRedisClient.set(key, JSON.stringify(value));
  },
  /**
   * Retrieves the value associated with a key from Redis.
   * @param key The key to retrieve.
   * @returns The value associated with the key, or undefined if the key does not exist.
   */
  get: async (key) => {
    console.log("Getting " + key);
    let value = await issuerRedisClient.get(key);
    return value == null ? undefined : JSON.parse(value);
  },
  /**
   * Checks if a key exists in Redis.
   * @param key The key to check.
   * @returns A boolean indicating whether the key exists.
   */
  has: async (key) => {
    console.log("Checking if " + key + " exists");
    return (await issuerRedisClient.exists(key)) == 1;
  },
};
