<script setup lang="ts">
/**
 * A component that displays an Issuer with all its properties except the revoked propert,
 *  which is better visalized as a chip/label compared to a tabular structure used here.
 */
import { Card } from '@/components/ui/card'
import type { Issuer } from '@/api'

const props = defineProps({
  issuer: {
    type: Object as () => Issuer,
    required: true
  }
})
</script>

<template>
  <div class="inline-grid gap-x-6 gap-y-2" style="grid-template-columns: max-content auto">
    <div class="font-bold col1">Trusted Since</div>
    <div class="col2">{{ issuer.trustedSince ?? '-' }}</div>

    <div class="font-bold col1">Trust Until</div>
    <div class="col2">{{ issuer.trustedUntil ?? '-' }}</div>

    <div class="font-bold col1">Trust Context Description</div>
    <div class="col2">{{ issuer.tcDescription ?? '-' }}</div>

    <div class="font-bold col1">Trust Context Identity</div>
    <div class="col2">{{ issuer.tcIdentity ?? '-' }}</div>

    <div class="font-bold col1">Credential Schemas</div>
    <div class="col2">
      <Card v-if="(issuer.credentialSchemas?.length ?? 0) > 0" class="p-6">
        <div
          class="inline-grid gap-x-6"
          style="grid-template-columns: auto auto"
          v-for="schema in issuer.credentialSchemas"
        >
          <div class="font-bold col1">ID</div>
          <div class="col2">{{ schema.id }}</div>

          <div class="font-bold col1">Schema type</div>
          <div class="col2">{{ schema.type }}</div>

          <div class="font-bold col1">Hash</div>
          <div class="col2 break-all">{{ schema.hash }}</div>

          <div class="font-bold col1">Inheritable</div>
          <div class="col2">{{ schema.inheritable }}</div>
        </div>
      </Card>
    </div>
  </div>
</template>
