<script lang="ts" setup>
/**
 * An abstract verification component that is used by both the frontend and the backend.
 * It requires a `verify` function that takes the issuer ID, the date and the serialized VC
 * and returns the verification result.
 * This function is called when the user clicks the "Verify" button.
 * The VerificationResult is then passed to the ExtensiveTrustPathComponent which visualizes it.
 */
import { type PropType, ref } from 'vue'

import type { VerificationResult } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import ExtensiveTrustPathComponent from './ExtensiveTrustPathComponent.vue'

const id = ref<string>()
const date = ref<string>()
const serializedVC = ref<string>()
const verifactionResult = ref<VerificationResult>()

interface VerifyFunction {
  (id?: string, date?: string, serializedVC?: string): Promise<VerificationResult | undefined>
}

const props = defineProps({
  verify: {
    type: Function as PropType<VerifyFunction>,
    required: true
  }
})

async function verifyIssuer() {
  verifactionResult.value = await props.verify(
    id.value == '' ? undefined : id.value,
    date.value == '' ? undefined : date.value,
    serializedVC.value == '' ? undefined : serializedVC.value
  )
}
</script>
<template>
  <div style="max-width: 900px; margin: 0 auto" class="flex flex-col gap-2">
    <div class="flex flex-row gap-2">
      <Input v-model="id" @keydown.enter="verifyIssuer" placeholder="Issuer ID" />
      <Button @click="verifyIssuer">Verify</Button>
    </div>
    <div class="flex flex-row gap-2">
      <Input v-model="date" placeholder="Timestamp, e.g. 2023-11-14" />
      <Input v-model="serializedVC" placeholder="JSON Verifiable Credential (just paste it here)" />
    </div>

    <ExtensiveTrustPathComponent :verificationResult="verifactionResult" />
  </div>
</template>
