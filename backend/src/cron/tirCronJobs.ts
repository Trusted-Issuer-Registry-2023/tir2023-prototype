import { CronJob } from "cron";
import { metadataRedisClient } from "../persistence/redisClient.js";
import { resolveTirRedis } from "../utils/redisTirResolver.js";

const cronTime = process.env.CRON_TIME ?? "0 0 * * *";
const fallbackAutoresolveDID = process.env.FALLBACK_AUTORESOLVE_DID;

// Automatically resolve TIR at predefined times
const job = new CronJob(
  cronTime,
  function () {
    console.log("CRON: Resolve TIR");
    metadataRedisClient.get("autoResolveDid").then((did: string | null) => {
      if (did != null) {
        resolveTirRedis(did);
      } else if (fallbackAutoresolveDID != undefined) {
        resolveTirRedis(fallbackAutoresolveDID);
      }
    });
  }, // onTick
  null, // onComplete
  true // start
);
