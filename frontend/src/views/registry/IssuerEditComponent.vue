<script lang="ts" setup>
/**
 * A component that allows editing an Issuer.
 * It takes an EditIssuer object as a prop and emits an update event when the issuer is updated.
 */
import { computed } from 'vue'

import { ArrowDownToLine, Clock3, PlusIcon, Trash2 } from 'lucide-vue-next'
import { calculateHash, fetchCredentialSchema } from 'tir-core'

import type { CredentialSchema } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'
import { isLoadingGlobal } from '@/config/state'

export interface EditIssuer {
  id: string | undefined
  trustedSince: string | undefined
  trustedUntil: string | undefined
  revoked: string
  tcDescription: string | undefined
  tcIdentity: string | undefined
  credentialSchemas: CredentialSchema[]
}

const emit = defineEmits(['submit', 'update:modelValue'])
const props = defineProps({
  modelValue: { type: Object as () => EditIssuer, required: true }, // the issuer to edit
  isLoading: Boolean, // whether the form is loading and should be disabled
  submitText: { type: String, required: true } // the text shown on the submit button
})

const issuer = computed({
  get() {
    return props.modelValue
  },
  set(issuer) {
    console.log('update: ' + issuer)
    emit('update:modelValue', props.modelValue)
  }
})

// Submit an event that the submit button was clicked
function submit() {
  emit('submit')
}

// Add a new schema to the issuer
function addSchema() {
  if (issuer.value.credentialSchemas != undefined)
    issuer.value.credentialSchemas.push({ id: '', type: '', hash: '', inheritable: false })
}

// Delete a schema from the issuer by its index
function deleteSchema(index: number) {
  if (issuer.value.credentialSchemas != undefined)
    issuer.value.credentialSchemas = issuer.value.credentialSchemas.filter((_, i) => i != index)
}

// Calculate the hash for a schema by its id
async function calculateHashForSchema(schema: CredentialSchema) {
  isLoadingGlobal.value = true
  try {
    schema.hash = calculateHash(JSON.stringify(await fetchCredentialSchema(schema.id)))
  } catch (e: any) {
    toast({
      title: 'Error',
      description: 'Could not calculate hash for schema: ' + e.message,
      variant: 'destructive'
    })
  }
  isLoadingGlobal.value = false
}
</script>
<template>
  <Card class="mt-2">
    <CardContent class="flex flex-col gap-2 p-4">
      <Label>ID</Label>
      <Input placeholder="did:web:example.com" v-model="issuer.id" :disabled="isLoading" />
      <Label>Trusted Since (ISO 8601)</Label>
      <div class="flex flex-row gap-2">
        <Input
          placeholder="2023-11-08T18:12:23+00:00"
          v-model="issuer.trustedSince"
          :disabled="isLoading"
        />
        <Button
          @click="issuer.trustedSince = new Date().toISOString()"
          class="whitespace-nowrap"
          :disabled="isLoading"
          variant="outline"
        >
          <Clock3 class="w-4 h-4 mr-2" /> Now
        </Button>
      </div>
      <Label>Trusted Until (ISO 8601)</Label>
      <div class="flex flex-row gap-2">
        <Input
          placeholder="2023-11-08T18:12:23+00:00"
          v-model="issuer.trustedUntil"
          :disabled="isLoading"
        />
        <Button
          @click="issuer.trustedUntil = new Date().toISOString()"
          class="whitespace-nowrap"
          :disabled="isLoading"
          variant="outline"
        >
          <Clock3 class="w-4 h-4 mr-2" /> Now
        </Button>
      </div>
      <Label>Revoked</Label>
      <Select v-model="issuer.revoked" :disabled="isLoading">
        <SelectTrigger :disabled="isLoading">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="null"> Not specified (null) </SelectItem>
            <SelectItem value="true"> true </SelectItem>
            <SelectItem value="false"> false </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Label>Trust Context: Trust Scope Description</Label>
      <Textarea
        placeholder="Private company from IT sector which may issue certificates within its business domain."
        v-model="issuer.tcDescription"
        :disabled="isLoading"
      />
      <Label>Trust Context: Verified Identity</Label>
      <Textarea
        placeholder="ABCDE GmbH, Berlin, Germany, HRB 123456, CEO: John Doe, VAT ID: DE123456789, Tax ID: 123/456/78901"
        v-model="issuer.tcIdentity"
        :disabled="isLoading"
      />
      <Label>Credential Schemas</Label>
      <Card class="mt-2 p-4">
        <Card
          class="p-4 my-2 flex flex-col gap-2"
          v-for="(schema, index) in issuer.credentialSchemas"
        >
          <div class="flex justify-between items-end">
            <Label>Schema URL (id)</Label>
            <Button @click="deleteSchema(index)" variant="outline" class="aspect-square p-0">
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="https://example.com/schema.json"
            v-model="schema.id"
            :disabled="isLoading"
          />
          <Label>Schema Type</Label>
          <Input placeholder="JsonSchema" v-model="schema.type" :disabled="isLoading" />
          <Label>Hash (SHA-256)</Label>
          <div class="flex flex-row gap-2">
            <Input v-model="schema.hash" :disabled="isLoading" />
            <Button
              @click="calculateHashForSchema(schema)"
              class="whitespace-nowrap"
              :disabled="schema.id == '' || isLoading"
              variant="outline"
            >
              <ArrowDownToLine class="w-4 h-4 mr-2" /> From URL
            </Button>
          </div>
          <Label>Inheritable</Label>
          <Switch
            :checked="schema.inheritable"
            @update:checked="(v: boolean) => (schema.inheritable = v)"
            v-model="schema.inheritable"
            :disabled="isLoading"
          />
        </Card>
        <Button @click="addSchema()">
          <PlusIcon class="w-4 h-4 mr-2" />
          Add Schema
        </Button>
      </Card>

      <div class="w-full flex flex-row justify-end mt-2">
        <Button @click="submit()" :disabled="isLoading">{{ submitText }}</Button>
      </div>
    </CardContent>
  </Card>
</template>
<style>
Label {
  margin-top: 0.5rem;
}
</style>
