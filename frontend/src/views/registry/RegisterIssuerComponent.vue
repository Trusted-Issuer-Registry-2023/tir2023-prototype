<script lang="ts" setup>
/**
 * A component that registers an Issuer in a Tezos TIR.
 * For the UI, it uses the IssuerEditComponent.
 */
import { ref } from 'vue'

import { registerIssuer } from '@/config/tirRepository'

import IssuerEditComponent, { type EditIssuer } from './IssuerEditComponent.vue'

const isLoading = ref<boolean>(false)

const issuer = ref<EditIssuer>({
  id: '',
  trustedSince: new Date().toISOString(),
  trustedUntil: '',
  revoked: 'null',
  tcDescription: '',
  tcIdentity: '',
  credentialSchemas: []
})

async function register() {
  await registerIssuer(
    issuer.value,
    () => {
      // clear form
      issuer.value = {
        id: '',
        trustedSince: new Date().toISOString(),
        trustedUntil: '',
        revoked: 'null',
        tcDescription: '',
        tcIdentity: '',
        credentialSchemas: []
      }
    },
    (v: boolean) => {
      isLoading.value = v
    }
  )
}
</script>

<template>
  Here you can register a new issuer.
  <div class="disabled:backdrop-filter" :disabled="isLoading">
    <IssuerEditComponent
      v-model="issuer"
      :isLoading="isLoading"
      :submitText="'Register Issuer'"
      @submit="register"
    />
  </div>
</template>
