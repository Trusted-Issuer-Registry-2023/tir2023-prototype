<script lang="ts" setup>
/**
 * A component that updates an Issuer of a Tezos TIR.
 * For the UI, it uses the IssuerEditComponent.
 */
import { ref } from 'vue'

import { updateIssuerValue as issuer } from '@/config/state'
import { updateIssuer } from '@/config/tirRepository'

import IssuerEditComponent from './IssuerEditComponent.vue'

const isLoading = ref<boolean>(false)

async function update() {
  await updateIssuer(
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
  Here you can update an issuer. <b>You cannot change the issuer id,</b> the id defines the issuer
  to be changed!
  <div class="disabled:backdrop-filter" :disabled="isLoading">
    <IssuerEditComponent
      v-model="issuer"
      :isLoading="isLoading"
      :submitText="'Update Issuer'"
      @submit="update"
    />
  </div>
</template>
