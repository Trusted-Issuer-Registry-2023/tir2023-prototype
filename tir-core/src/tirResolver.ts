/**
 * Logic for TIR resolution
 */
import axios from 'axios'
import { DIDDocument, Resolver } from 'did-resolver'
import { getResolver as getResolverWeb } from 'web-did-resolver'

import { TezosToolkit } from '@taquito/taquito'

import { ExpandableTezosTIR } from './model/expandableTezosTIR'
import { ExpandableTIR } from './model/expandableTIR'
import { Issuer } from './model/issuer'
import { TIR } from './model/tIR'
import { parseTezosTIR } from './tezosTIRParser'

export type ResolvedTIR = Map<string, ResolvedIssuer>

// A simple abstract map interface, allowing to use different implementations (in-memory map, external database, ...)
export interface SimpleMap<K, V> {
  set: (key: K, value: V) => Promise<void>
  get: (key: K) => Promise<V | undefined>
  has: (key: K) => Promise<boolean>
}

export type ResolvedIssuer = { issuer: Issuer; path: string[]; tir?: TIR }
export type SimpleTIRMap = SimpleMap<string, ResolvedIssuer>

export class TIRResolver {
  resolver = new Resolver({
    ...getResolverWeb()
  })

  constructor(private tezos: TezosToolkit) {}

  /**
   * Resolves the complete TIR for a given DID and stores it in a in-memory map
   * @param did the TIR's DID which will be resolved
   * @param maxDepth a maximal depth of hierarchy levels that should be resolved
   * @returns a resolved TIR
   */
  async resolveCompleteTIRInMemory(did: string, maxDepth?: number): Promise<ResolvedTIR> {
    let issuerPathMap: ResolvedTIR = new Map<string, ResolvedIssuer>()
    const inMemoryMapInterface: SimpleTIRMap = {
      set: async (key: string, value: ResolvedIssuer) => {
        issuerPathMap.set(key, value)
      },
      get: async (key: string) => {
        return issuerPathMap.get(key)
      },
      has: async (key: string) => {
        return issuerPathMap.has(key)
      }
    }
    await this.resolveCompleteTIR(did, inMemoryMapInterface, maxDepth)
    return issuerPathMap
  }

  /**
   * Resolves a complete TIR with its sub-registries and stores it using the map interface
   * No TIR will be returned, instead the passed map will be filled with the resolved issuers
   * Breadth-first search is used to resolve the TIR tree
   * @param did the TIR's DID which will be resolved
   * @param map the abstract map interface
   * @param maxDepth maximal depth of hierarchy levels that should be resolved
   */
  async resolveCompleteTIR(did: string, map: SimpleTIRMap, maxDepth?: number): Promise<void> {
    // Queue of potential TIRs that are next to be resolved
    let queue: { did: string; maxDepth?: number }[] = []
    // Add the root issuer to the queue
    queue.push({ did: did, maxDepth: maxDepth })
    // Store the root issuer in the map
    map.set(did, {
      issuer: {
        id: did
      },
      path: [did]
    })
    // Start breadth-first search
    // While there are still potential TIRs to be resolved
    while (queue.length > 0) {
      // Get the next TIR to be resolved from the queue
      let currentElement: { did: string; maxDepth?: number } = queue.shift()!

      // Resolve the TIR
      let root: TIR | null = await this.resolveSingleTIR(currentElement.did)

      // If there is no TIR at the DID, continue with the next element in the queue
      if (root == null) {
        continue
      }

      // Add the TIR information to the issuer element of the map
      let currentElementMapEntry = (await map.get(currentElement.did))!
      map.set(currentElement.did, { ...currentElementMapEntry, tir: root })

      // For every subissuer
      for (let subIssuerId of Object.keys(root.issuers ?? {})) {
        let subIssuer = root.issuers![subIssuerId]
        // If issuer was already handled, ignore (for now)
        if (await map.has(subIssuer.id)) {
          // TODO: handle loops differently, could be important when different data / permissions
          // Currently, only the first issuer is used, the others are ignored
          continue
        } else {
          // If this issuer is unknown

          // Get the its parent's trust path
          let parentPath = (await map.get(currentElement.did))?.path

          if (parentPath == undefined) {
            throw new Error(
              'Inconsistent TIR: Parent path is undefined, although it should already have been handled.'
            )
          }
          // Store the issuer with its trust path in the map
          map.set(subIssuerId, {
            issuer: subIssuer,
            path: [...parentPath, subIssuer.id]
          })
          // If the issuer has no CredentialSchema or at least one inheritable CredentialSchemas, has a DID and maxDepth is not reached
          // Add the issuer to the queue, because it could have a sub-registry
          if (
            (subIssuer.credentialSchemas == undefined ||
              subIssuer.credentialSchemas.find(e => e.inheritable) != undefined) &&
            this.isDid(subIssuer.id) &&
            (currentElement.maxDepth ?? 1) > 0
          ) {
            queue.push({
              did: subIssuer.id,
              maxDepth:
                currentElement.maxDepth == undefined ? undefined : currentElement.maxDepth - 1
            })
          }
        }
      }
    }
  }

  // Simple helper function to check if a string is a DID
  isDid(id: string) {
    return id.startsWith('did:')
  }

  /**
   * Resolves a single TIR with its sub-registries from a DID
   * @param did the TIR's DID which will be resolved
   * @param tezosOnlyIssuerIds whether for Tezos TIRs only the issuer IDs should be resolved instead of fetching all issuers from the Michelson Big-map
   * @param noCache whether the TIR should be fetched without using the browser cache
   * @returns the resolved TIR
   */
  async resolveSingleTIR(
    did: string,
    tezosOnlyIssuerIds?: boolean,
    noCache?: boolean
  ): Promise<ExpandableTIR | null> {
    let result = await this.getAddressByDid(did)
    if (result == null) {
      return null
    }
    let tir: ExpandableTIR | null = null
    if (result.type == 'tezos') {
      tir = await this.fetchTezosTir(result.address, tezosOnlyIssuerIds)
    } else if (result.type == 'web') {
      tir = await this.fetchWebTir(result.address, noCache)
    }
    if (tir != null) {
      tir.did = result.id
    }
    return tir
  }

  async fetchTezosTir(
    address: string,
    tezosOnlyIssuerIds?: boolean
  ): Promise<ExpandableTIR | null> {
    let contract = await this.tezos.contract.at(address)
    let storage = await contract.storage()
    let tezosTirStorage: ExpandableTezosTIR = await parseTezosTIR(storage, tezosOnlyIssuerIds)
    return tezosTirStorage
  }

  async fetchWebTir(endpointUri: string, noCache?: boolean): Promise<ExpandableTIR | null> {
    const tir = await this.api<TIR>(endpointUri, noCache ?? false)
    return tir
  }

  private async api<T>(url: string, noCache: boolean): Promise<T> {
    let response = await axios(
      url,
      noCache
        ? {
            // query URL without using browser cache
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        : {}
    )
    if (!response.status.toString().startsWith('2')) {
      throw new Error(response.statusText)
    }
    return await response.data
  }

  /**
   * Resolves a TIR endpoint from a DID
   * The first service endpoint of a supported type will be used, potentially transformed, and returned
   * @param did the DID which will be resolved
   * @returns an object containing the chosen service id, address, TIR method-specific identifier, or null
   */
  async getAddressByDid(
    did: string
  ): Promise<{ id: string; type: string; address: string } | null> {
    // Resolve the DID Document
    let didDoc: DIDDocument | null = (await this.resolver.resolve(did)).didDocument

    // Return null, in case no DID Document could be resolved
    if (didDoc == null || didDoc.service == null) {
      console.log(did + ': DID Document or service is null')
      return null
    }

    // For each DID service with some TIR method service type
    for (let service of didDoc.service.filter(service =>
      service.type.startsWith('TrustedIssuerRegistry2023')
    )) {
      // Select a service endpoint (in case of multiple, choose a random endpoint)
      let singleChosenServiceEndpoint: string | undefined
      if (typeof service.serviceEndpoint == 'string') {
        singleChosenServiceEndpoint = service.serviceEndpoint as string
      } else if (Array.isArray(service.serviceEndpoint)) {
        // choose a random service endpoint for load-balancing
        const randomIndex = Math.floor(Math.random() * service.serviceEndpoint.length)
        singleChosenServiceEndpoint = service.serviceEndpoint[randomIndex] as string
      }
      if (singleChosenServiceEndpoint == undefined) return null
      // Get the concrete service endpoint depending on the TIR method
      switch (service.type) {
        // In case of a Tezos TIR, get the smart contracts address
        case 'TrustedIssuerRegistry2023Tezos': {
          let address = singleChosenServiceEndpoint.split(':').find(e => e.startsWith('KT1'))
          if (address == undefined) return null
          return { id: service.id, address: address, type: 'tezos' }
        }
        // In case of a Web TIR, just return its endpoint
        case 'TrustedIssuerRegistry2023Web': {
          return { id: service.id, address: service.serviceEndpoint as string, type: 'web' }
        }
      }
    }
    return null
  }
}
