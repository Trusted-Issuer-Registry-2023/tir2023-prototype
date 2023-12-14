<script lang="ts" setup>
/**
 * A component that verifies an Issuer using an API request to the backend.
 */
import { useToast } from '@/components/ui/toast';
import { api } from '@/config/state';

import AbstractVerifyComponent from './AbstractVerifyComponent.vue';

const toast = useToast().toast

async function verify(id?: string, date?: string, serializedVC?: string) {
  try {
    const vc = (serializedVC ?? '') == '' ? undefined : JSON.parse(serializedVC!)
    if ((id == undefined || id == '') && vc == undefined) {
      toast({
        title: 'Please enter either an issuer ID or a valid Verifiable Credential (JSON)',
        variant: 'destructive'
      })
      return
    }
    return (
      await api.value.postVerify({
        id: id,
        timestamp: date == '' ? undefined : date,
        vc: vc
      })
    ).data
  } catch (e: any) {
    toast({
      title: 'Verification Error',
      description: e.message,
      variant: 'destructive'
    })
  }
}
</script>
<template>
  <AbstractVerifyComponent :verify="verify" />
</template>
