<script lang="ts" setup>
/**
 * A component that verifies an Issuer standalone in the frontend.
 */
import { ref } from 'vue'

import {
  type ResolvedIssuer,
  type ResolvedTIR,
  type SimpleTIRMap,
  TIRResolver,
  verifyIssuer
} from 'tir-core'

import { useToast } from '@/components/ui/toast/use-toast'
import { isLoadingGlobal, tezos, tirDid } from '@/config/state'
import { TezosToolkit } from '@taquito/taquito'

import AbstractVerifyComponent from './AbstractVerifyComponent.vue'

const resolvedTir = ref<ResolvedTIR>()

const { toast } = useToast()

/**
 * Resolves the whole TIR and stores it in the global variable `resolvedTir`.
 */
async function resolveWholeTIR() {
  if (tirDid.value == undefined || tirDid.value == '') {
    toast({
      title: 'Please set a TIR-DID first.'
    })
    return
  }
  let resolver = new TIRResolver(tezos.value as TezosToolkit)
  isLoadingGlobal.value = true
  let res = await resolver.resolveCompleteTIRInMemory(tirDid.value)
  isLoadingGlobal.value = false
  resolvedTir.value = res
}

/**
 * Verifies an Issuer.
 * @param id The id of the issuer.
 * @param date The date of the VC.
 * @param serializedVC The serialized VC.
 * @returns The verification result or null.
 */
async function verify(id?: string, date?: string, serializedVC?: string) {
  if (resolvedTir.value == undefined) {
    toast({
      title: 'Resolving TIR',
      description: 'After successful resolution, the verification will start.'
    })
    await resolveWholeTIR()
  }

  try {
    let simpleTirMap: SimpleTIRMap = {
      get: async (key: string) => {
        return resolvedTir.value!.get(key)
      },
      has: async (key: string) => {
        return resolvedTir.value!.has(key) ?? false
      },
      set: async (key: string, value: ResolvedIssuer) => {
        resolvedTir.value!.set(key, value)
      }
    }
    return verifyIssuer(
      simpleTirMap,
      id,
      (date ?? '') == '' ? undefined : new Date(date!),
      (serializedVC ?? '') == '' ? undefined : JSON.parse(serializedVC!)
    )
  } catch (e: any) {
    toast({
      title: 'Verification Error',
      description: e.message,
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <AbstractVerifyComponent :verify="verify" />
</template>
