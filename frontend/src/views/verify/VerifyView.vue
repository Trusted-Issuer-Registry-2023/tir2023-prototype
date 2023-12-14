<script lang="ts" setup>
/**
 * The "Verify" page, enabling issuer verification by frontend and backend.
 * Contains two tabs, one for the frontend and one for the backend.
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import VerifyBackendComponent from './VerifyBackendComponent.vue'
import VerifyFrontendComponent from './VerifyFrontendComponent.vue'
import EnterTirHintComponent from '@/components/EnterTirHintComponent.vue'
</script>

<template>
  <EnterTirHintComponent />
  <Tabs defaultValue="backend">
    <TabsList class="grid w-full grid-cols-2">
      <TabsTrigger value="backend">Backend</TabsTrigger>
      <TabsTrigger value="frontend">Frontend</TabsTrigger>
    </TabsList>
    <br />
    
    <TabsContent value="backend">
      <VerifyBackendComponent />
    </TabsContent>
    <TabsContent value="frontend">
      <VerifyFrontendComponent />
    </TabsContent>
  </Tabs>
</template>
