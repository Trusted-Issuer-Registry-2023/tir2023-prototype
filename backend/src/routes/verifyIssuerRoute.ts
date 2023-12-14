/**
 * Handles the POST request to verify an issuer.
 * Corresponds to the `/verify` endpoint of the OpenAPI specification.
 */
import express, { Request, Response, Router } from "express";
import { issuerRedisClient, redisMapInterface } from "../persistence/redisClient.js";
import { verifyIssuer } from "tir-core";
import { StatusCodes } from "http-status-codes";
import { PostVerifyRequest } from "../model/postVerifyRequest.js";

export const router: Router = express.Router();

router.post("/verify", async (req: Request, res: Response) => {
  const body: PostVerifyRequest = req.body;
  
  if ((await issuerRedisClient.dbSize()) == 0) {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).send("No IDs in Redis");
    return;
  }

  const id: string | undefined = body.id;  
  const vc = body.vc;

  console.log("Verifying " + id);
  if (id == undefined && vc == undefined) {
    res.status(StatusCodes.BAD_REQUEST).send("No id or VC provided");
    return;
  }

  const timestamp =
    body.timestamp != undefined ? new Date(body.timestamp) : undefined;

  let result = await verifyIssuer(redisMapInterface, id, timestamp, vc);

  res.json(result);
});
