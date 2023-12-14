<script lang="ts" setup>
/**
 * The app's navigation bar.
 * Handles wallet connection and TIR-DID input.
 */

import IconBeacon from './icons/IconBeacon.vue'
import { fetchTir } from '../utils/fetchTir'
import { SendHorizontal } from 'lucide-vue-next'

import { RouterLink } from 'vue-router'

import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import { getWallet, requestRequiredPermissions } from '@/config/wallet'
import type { BeaconWallet } from '@taquito/beacon-wallet'
import type { TezosToolkit } from '@taquito/taquito'
import { useToast } from './ui/toast'
import { currTzAddr, isConnected, tezos, tirDid, wallet } from '@/config/state'

const { toast } = useToast()

const handleLogin = async () => {
  let nonNullWallet: BeaconWallet | undefined = wallet.value
  if (wallet.value == undefined)
    nonNullWallet = await getWallet(
      wallet.value,
      (w) => (wallet.value = w),
      tezos.value as TezosToolkit
    )

  try {
    const activeAccount = await nonNullWallet!.client.getActiveAccount()
    if (activeAccount) {
      console.log('Already connected:', activeAccount.address)
      connectWithAddress(activeAccount.address)

      toast({
        title: 'You are already connected.'
      })
    } else {
      const permissions = await requestRequiredPermissions(nonNullWallet!)
      if (permissions != undefined) {
        console.log('New connection:', permissions?.address)
        connectWithAddress(permissions?.address)
      }
    }
  } catch (error: any) {
    toast({
      title: 'Error while connecting wallet.',
      description: error.message
    })
    clearConnectionStatus()
  }
}

function connectWithAddress(address: string) {
  currTzAddr.value = address
  isConnected.value = true
}

function clearConnectionStatus() {
  isConnected.value = false
  currTzAddr.value = undefined
}

const handleLogout = async () => {
  if (wallet.value == undefined) return
  try {
    await wallet.value.client.clearActiveAccount()
    clearConnectionStatus()
  } catch (error) {
    window.alert(error)
  }
}

const setTirDid = (did: string | number) => {
  tirDid.value = did.toString()
  localStorage.setItem('tirDid', did.toString())
}
</script>

<template>
  <header class="w-full">
    <nav class="mt-2 mb-3 flex flex-row gap-4 w-full items-center">
      <div class="flex items-center gap-2">
        <img src="/favicon.svg" alt="TIR-Connect Icon" class="w-8" />
        <RouterLink to="/"><b class="no">TIR&#x2011;Connect</b></RouterLink>
      </div>
      <RouterLink to="/registry">Registry</RouterLink>
      <RouterLink to="/verify">Verify</RouterLink>
      <div class="flex justify-center flex-1">
        <Input
          type="text"
          placeholder="did:web:example.com:tir"
          class="max-w-xs"
          v-model="tirDid"
          @change="setTirDid($event.target.value)"
          @keydown.enter="fetchTir()"
        />
        <Button variant="outline" class="ml-2 aspect-square p-0" @click="fetchTir()">
          <SendHorizontal class="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Button v-if="!isConnected" variant="outline" @click="handleLogin()">
          <IconBeacon class="h-6 mr-2" /> Connect Wallet
        </Button>
        <Button v-if="isConnected" variant="outline" @click="handleLogout()">
          Disconnect Wallet
        </Button>
      </div>
    </nav>
  </header>
</template>
