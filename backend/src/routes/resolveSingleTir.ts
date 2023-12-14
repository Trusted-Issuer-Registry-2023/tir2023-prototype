
/**
 * Resolves a single Trusted Issuer Registry (TIR) entry based on the provided DID.
 * Corressponds to the `/resolveSingleTir` endpoint of the OpenAPI specification.
 */
import express, { Request, Response, Router } from "express";
import { TIRResolver } from "tir-core";
import { TezosToolkit } from "@taquito/taquito";
import { GetResolveDidRequest } from "../model/getResolveDidRequest.js";
import { ExpandableTIR } from "../model/expandableTIR.js";
import { StatusCodes } from "http-status-codes";

export const router: Router = express.Router();

router.get("/resolveSingleTir/", async (req: Request, res: Response) => {
  const body: GetResolveDidRequest = req.body;
  const did = body.did;

  if ((did ?? "") == "") {
    res.send("No TIR provided");
    return;
  }

  let resolver = new TIRResolver(
    new TezosToolkit(process.env.TEZOS_RPC_URL ?? "")
  );

  console.log("Start Resolving TIR: " + did);
  const tir: ExpandableTIR | null = await resolver.resolveSingleTIR(
    did,
    body.tezosOnlyIssuerIds,
    body.noCache
  );
  console.log("Done Resolving TIR");

  if (tir == null) {
    res.sendStatus(StatusCodes.NOT_FOUND);
  } else {
    res.json(tir);
  }
});
