
/**
 * Handles the POST request to resolve a complete Trusted Issuer Registry (TIR).
 * Corresponds to the `/resolveTir` endpoint of the OpenAPI specification.
 */
import express, { Request, Response, Router } from "express";
import { resolveTirRedis } from "../utils/redisTirResolver.js";
import { issuerRedisClient } from "../persistence/redisClient.js";
import { StatusCodes } from "http-status-codes";
import { PostResolveTIRRequest } from "../model/postResolveTIRRequest.js";
import { PostResolveTIR200Response } from "../model/postResolveTIR200Response.js";

export const router: Router = express.Router();

router.post("/resolveTir/", async (req: Request, res: Response) => {
  const body: PostResolveTIRRequest = req.body;
  if ((body.did ?? "") == "") {
    res.status(StatusCodes.BAD_REQUEST);
    return;
  }

  await resolveTirRedis(body.did);

  let allKeys: string[] = await issuerRedisClient.keys("*");
  let response: PostResolveTIR200Response = { resolvedIssuerIds: allKeys };
  res.json(response);
});
