<script lang="ts" setup>
/**
 * A component that deletes an Issuer from a Tezos TIR.
 */
import { ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteIssuer } from '@/config/tirRepository';

const isLoading = ref<boolean>(false)

const id = ref<string>('')
</script>

<template>
  <div>
    Here you can delete an issuer.
    <Input placeholder="e.g. did:web:example.com" v-model="id" class="my-2" :disabled="isLoading" />
    <Button
      @click="
        deleteIssuer(
          id,
          () => (id = ''),
          (v) => (isLoading = v)
        )
      "
      :disabled="isLoading"
      >Delete Issuer</Button
    >
  </div>
</template>
