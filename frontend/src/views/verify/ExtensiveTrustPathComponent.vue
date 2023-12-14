<script setup lang="ts">
/**
 * Visualizes a VerificationResult created from an issuer verification.
 */
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-vue-next'

import type { VerificationResult } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import IssuerComponent from '@/views/registry/IssuerComponent.vue'

const props = defineProps({
  verificationResult: {
    type: Object as () => VerificationResult
  }
})
</script>

<template>
  <Card v-if="verificationResult != undefined">
    <CardHeader>
      <CardTitle :class="verificationResult.valid ? 'text-green-600' : 'text-red-600'">
        <div class="flex flex-row gap-3">
          {{ verificationResult.valid ? 'Issuer is trusted' : 'Issuer is NOT trusted' }}
          <CheckCircle2 v-if="verificationResult.valid" class="text-green-600" />
          <XCircle v-if="!verificationResult.valid" class="text-red-600" />
        </div>
      </CardTitle>
      <CardDescription>{{
        verificationResult.issuerResults?.length == 0
          ? 'The issuer was not found in the registry.'
          : 'See below for details.'
      }}</CardDescription>
    </CardHeader>
  </Card>
  <Card
    v-if="verificationResult != undefined && verificationResult.issuerResults.length > 0"
    class="p-4 flex flex-col gap-4"
  >
    <div v-for="(issuer, index) of verificationResult.issuerResults" class="w-full">
      <div v-if="index != 0" class="flex flex-row w-full overflow-hidden gap-12 py-8">
        <div
          :class="'w-4 ml-1 rounded-lg ' + (issuer.valid ? 'bg-green-500 ' : 'bg-red-500 ')"
        ></div>
        <Card class="p-4 w-full my-10">
          <CardHeader>
            <CardTitle>{{ issuer.issuer?.id }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="inline-grid w-full gap-4"
              style="grid-template-columns: max-content max-content auto"
            >
              <template v-for="verificationFraction of issuer.verifications">
                <div class="flex items-center">{{ verificationFraction.title }}</div>
                <div class="flex items-center">
                  <CheckCircle2 v-if="verificationFraction.valid === true" class="text-green-600" />
                  <HelpCircle
                    v-if="verificationFraction.valid === undefined"
                    class="text-gray-600"
                  />
                  <XCircle v-if="verificationFraction.valid === false" class="text-red-600" />
                </div>
                <div class="flex items-center">
                  {{ verificationFraction.message }}
                </div>
              </template>
            </div>
            <template v-if="!issuer.valid && issuer.issuer != undefined">
              <Separator class="my-4" />
              <IssuerComponent :issuer="issuer.issuer" />
            </template>
          </CardContent>
        </Card>
      </div>
      <Card class="p-4">
        <CardHeader>
          <CardTitle>{{ issuer.issuer?.id }}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  </Card>
  <Card v-if="verificationResult != undefined" class="p-4">
    <pre>{{ verificationResult }}</pre>
  </Card>
</template>
