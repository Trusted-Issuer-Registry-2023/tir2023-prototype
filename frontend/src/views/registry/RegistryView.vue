<script setup lang="ts">
/**
 * The "Registry" page, enabling TIR management.
 * Contains Tabs for the different TIR management features.
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { activeRegistryTab, currTzAddr, isConnected, isLoadingGlobal, tzOwner } from '@/config/state'

import DeleteIssuerComponent from './DeleteIssuerComponent.vue'
import RegistryContentView from './RegistryContentView.vue'
import RegisterIssuerComponent from './RegisterIssuerComponent.vue'
import SetMetadataComponent from './SetMetadataComponent.vue'
import UpdateIssuerComponent from './UpdateIssuerComponent.vue'
import EnterTirHintComponent from '@/components/EnterTirHintComponent.vue'
</script>

<template>
  <div
    v-if="isConnected && tzOwner != undefined && tzOwner != currTzAddr"
    class="text-red-500 font-bold mb-2"
  >
    Wrong Tezos account! You must connect with Tezos account specified as owner of the TIR:
    {{ tzOwner }}
  </div>
  <EnterTirHintComponent />
  <!-- When loading, prevent all clicks with "pointer-events-none" -->
  <Tabs
    defaultValue="registry"
    v-model="activeRegistryTab"
    v-bind:class="isLoadingGlobal ? 'fadedOut pointer-events-none' : ''"
  >
    <TabsList>
      <TabsTrigger value="registry">Registry</TabsTrigger>
      <div
        :title="
          !isConnected && tzOwner != undefined
            ? 'You must connect your wallet first.'
            : tzOwner == undefined
              ? 'The TIR management feature is only available for Tezos TIRs.'
              : tzOwner != currTzAddr
                ? 'You are not the owner of the contract.'
                : ''
        "
      >
        <TabsTrigger value="registerIssuer" :disabled="!isConnected || tzOwner != currTzAddr">
          Register Issuer
        </TabsTrigger>
        <TabsTrigger value="updateIssuer" :disabled="!isConnected || tzOwner != currTzAddr">
          Update Issuer
        </TabsTrigger>
        <TabsTrigger value="deleteIssuer" :disabled="!isConnected || tzOwner != currTzAddr">
          Delete Issuer
        </TabsTrigger>
        <TabsTrigger value="setMetadata" :disabled="!isConnected || tzOwner != currTzAddr">
          Set Metadata
        </TabsTrigger>
      </div>
    </TabsList>
    <br />
    <TabsContent value="registry">
      <RegistryContentView />
    </TabsContent>
    <TabsContent value="registerIssuer">
      <RegisterIssuerComponent />
    </TabsContent>
    <TabsContent value="updateIssuer">
      <UpdateIssuerComponent />
    </TabsContent>
    <TabsContent value="deleteIssuer">
      <DeleteIssuerComponent />
    </TabsContent>
    <TabsContent value="setMetadata">
      <SetMetadataComponent />
    </TabsContent>
  </Tabs>
</template>

<style>
.fadedOut {
  opacity: 0.4;
}
</style>
