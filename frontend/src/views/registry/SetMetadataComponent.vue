<script lang="ts" setup>
/**
 * A component that sets a Tezos TIR's metadata.
 */
import { ref } from 'vue'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { setMetadata } from '@/config/tirRepository'

const isLoading = ref<boolean>(false)

const extraMetadata = ref<string>('')
const ttl = ref<number>()
</script>

<template>
  Here you can set the TIR's metadata.
  <Card class="mt-2 p-4">
    <Label>Extra Metadata</Label>
    <Textarea
      placeholder='{ "key": "value" }'
      v-model="extraMetadata"
      class="my-2"
      :disabled="isLoading"
    />
    <Label>TTL (cache expiration in seconds)</Label>
    <Input
      placeholder="e.g. 86400"
      v-model="ttl"
      type="number"
      class="my-2"
      :disabled="isLoading"
    />

    <Button
      @click="
        setMetadata(
          ttl ?? 0,
          extraMetadata,
          () => {
            extraMetadata = ''
            ttl = undefined
          },
          (v: boolean) => (isLoading = v)
        )
      "
      :disabled="isLoading"
      >Set Metadata</Button
    >
  </Card>
</template>
