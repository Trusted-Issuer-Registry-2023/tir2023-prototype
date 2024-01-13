
/**
 * Handles the POST request to set the auto-resolve DID.
 * Corresponds to the `/setAutoResolveDid` endpoint of the OpenAPI specification.
 */
import express, { Request, Response, Router } from "express";
import { metadataRedisClient } from "../persistence/redisClient.js";
import { StatusCodes } from "http-status-codes";
import { PostSetAutoResolveDIDRequest } from "../model/postSetAutoResolveDIDRequest.js";

export const router: Router = express.Router();

router.post("/setAutoResolveDid/", async (req: Request, res: Response) => {
  let body: PostSetAutoResolveDIDRequest = req.body;
  if ((body.did ?? "") == "") {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }
  metadataRedisClient.set("autoResolveDid", body.did);
  res.sendStatus(StatusCodes.OK);
});
