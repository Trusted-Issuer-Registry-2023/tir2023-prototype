<script setup lang="ts">
/**
 * This is the main component of the frontend.
 */
import { onMounted } from 'vue'

import ProgressBar from 'primevue/progressbar'
import { RouterView } from 'vue-router'

import Separator from '@/components/ui/separator/Separator.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { currTzAddr, isConnected, isLoadingGlobal, tezos, tirDid, wallet } from '@/config/state'
import { getWallet } from '@/config/wallet'
import type { BeaconWallet } from '@taquito/beacon-wallet'
import type { TezosToolkit } from '@taquito/taquito'

import NavigationBar from './components/NavigationBar.vue'

function connectWithAddress(address: string) {
  currTzAddr.value = address
  isConnected.value = true
}

onMounted(async () => {
  // check for active wallet connection
  let nonNullWallet: BeaconWallet | undefined = wallet.value
  if (wallet.value == undefined)
    nonNullWallet = await getWallet(
      wallet.value,
      (w) => (wallet.value = w),
      tezos.value as TezosToolkit
    )
  const activeAccount = await nonNullWallet!.client.getActiveAccount()
  if (activeAccount) {
    connectWithAddress(activeAccount.address)
  }

  // load tirDid from localstorage
  const lsTirDid: string | null = localStorage.getItem('tirDid')
  if (lsTirDid && lsTirDid.length > 0) {
    tirDid.value = lsTirDid
  }
})
</script>

<template>
  <ProgressBar
    :class="{ invisible: !isLoadingGlobal }"
    mode="indeterminate"
    style="height: 5px; width: 100%"
    :pt="{
      value: { style: { backgroundColor: 'var(--my-primary-color)' } }
    }"
  />
  <div class="mx-4 max-md:mx-2 flex flex-col items-center">
    <NavigationBar />
    <Separator />
    <main class="py-2">
      <RouterView />
    </main>
  </div>
  <Toaster />
</template>

<style scoped>
header,
main {
  max-width: 1200px;
  width: 100%;
}
</style>
