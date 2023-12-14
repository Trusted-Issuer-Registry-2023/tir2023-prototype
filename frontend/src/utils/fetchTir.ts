/**
 * This file contains utility functions to load a TIR from either the cache or the blockchain.
 */
import { TIRResolver } from 'tir-core'

import type { ExpandableTezosTIR, ExpandableTIR } from '@/api'
import { useToast } from '@/components/ui/toast'
import { fetchedTIR, isLoadingGlobal, tezos, tirDid, tzOwner } from '@/config/state'
import type { TezosToolkit } from '@taquito/taquito'

const toast = useToast().toast

export async function fetchTir() {
  console.log('Fetching TIR');
  
  if (tirDid.value == null || tirDid.value == '') {
    console.log('No TIR did given');
    
    return
  }
  let resolver = new TIRResolver(tezos.value as TezosToolkit)
  isLoadingGlobal.value = true
  // fetch the TIR, in case of blockchain, do not expand the issuers, in case of web, ignore the http cache
  let tir = await resolver.resolveSingleTIR(tirDid.value, true, true)

  if (tir != null) {
    fetchedTIR.value = tir as ExpandableTIR
  } else {
    toast({
      title: 'No TIR found',
      description: 'The given DID did not resolve to a TIR.',
      variant: 'destructive'
    })
  }
  isLoadingGlobal.value = false

  // Set global owner variable to check at other places if the user is the owner of the contract
  if (isTezosTIR(fetchedTIR.value as ExpandableTIR | null)) {
    tzOwner.value = (fetchedTIR.value as ExpandableTezosTIR).owner as string
  } else {
    tzOwner.value = undefined
  }
}

export function isTezosTIR(tir?: ExpandableTIR | null): boolean {
  return tir?.method == 'TrustedIssuerRegistry2023Tezos'
}
