<script lang="ts" setup>
/**
 * A component that displays the currently resolved TIR.
 * In case of a Tezos TIR, it also allows to expand (fetch the additional data from the blockchain),
 * edit, and delete the issuers
 */
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import IssuerComponent from '@/views/registry/IssuerComponent.vue'

import { issuerFromApiResult, serializeObjectContainingMaps } from 'tir-core'
import { onMounted, computed } from 'vue'
import { deleteIssuer } from '@/config/tirRepository'
import { Trash2, RefreshCcw, Pencil, Expand } from 'lucide-vue-next'

import {
  isConnected,
  currTzAddr,
  activeRegistryTab,
  updateIssuerValue,
  tzOwner,
  fetchedTIR,
  tirDid
} from '@/config/state'

import { fetchTir, isTezosTIR } from '@/utils/fetchTir'
import type { ExpandableTezosTIR, Issuer } from '@/api'
import type { BigMapAbstraction } from '@taquito/taquito'

// The TIRs storage serialized as a string
const storageString = computed(() =>
  fetchedTIR.value == null ? '' : serializeObjectContainingMaps(fetchedTIR.value, 2)
)
// The issuers of the TIR
const entries = computed(() =>
  Array.from(fetchedTIR.value != null ? Object.values(fetchedTIR.value.issuers) : [])
)

// Update the issuer: Set the issuer to update and switch to the update tab
function updateIssuer(issuer: Issuer) {
  updateIssuerValue.value = {
    id: issuer.id,
    trustedSince: issuer.trustedSince ?? undefined,
    trustedUntil: issuer.trustedUntil ?? undefined,
    revoked: issuer.revoked == null ? 'null' : issuer.revoked ? 'true' : 'false',
    tcDescription: issuer.tcDescription ?? undefined,
    tcIdentity: issuer.tcIdentity ?? undefined,
    credentialSchemas: issuer.credentialSchemas ?? []
  }
  activeRegistryTab.value = 'updateIssuer'
}

// Expand an issuer: Fetch the issuer from the blockchain and add it to the TIR
async function expandIssuerById(id: string) {
  if (fetchedTIR.value?.issuersMichelsonMap == undefined) {
    console.log('Cannot expand issuer, issersMichelsonMap is undefined')
    return
  }
  let result = await (fetchedTIR.value?.issuersMichelsonMap as BigMapAbstraction | undefined)?.get(
    id
  )
  if (result != undefined) {
    let issuer: Issuer = issuerFromApiResult(result)
    if (issuer != undefined && fetchedTIR.value != undefined) {
      fetchedTIR.value.issuers[id] = issuer
      fetchedTIR.value.expandedIssuerIds?.push(id)
    }
  }
}

// Whether the TIR is a Tezos TIR and the owner's wallet is connected
// Then the Tezos buttons should be shown
const showTezosButtons = computed(
  () => !(tzOwner.value == undefined || !isConnected.value || tzOwner.value != currTzAddr.value)
)

// Whether the TIR is a Tezos TIR
const fetchedTIRIsTezos = computed(() => isTezosTIR(fetchedTIR.value))

// Load the TIR on mount
onMounted(() => {
  if (fetchedTIR.value == undefined) {
    // load tirDid from localstorage
    // normally, this is done in App.vue, but on reload of this page, it does not happen fast enough
    const lsTirDid: string | null = localStorage.getItem('tirDid')
    if (lsTirDid && lsTirDid.length > 0) {
      tirDid.value = lsTirDid
    }
    fetchTir()
  }
})
</script>

<template>
  <div className="w-full flex flex-col gap-2">
    <div class="flex flex-row justify-between items-center">
      <div>
        Here you find all issuers registered in the TIR.
        <b>{{
          tzOwner != undefined && !showTezosButtons
            ? "Please connect with the owner's wallet to enable editing."
            : ''
        }}</b>
      </div>
      <Button @click="fetchTir()" variant="secondary">
        <RefreshCcw class="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
    <!-- Here starts the TIR visualization -->
    <Card v-if="fetchedTIR != undefined" class="w-full mb-2">
      <CardHeader>
        <CardTitle>{{ fetchedTIR.did }}</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Metadata -->
        <div
          class="inline-grid w-full gap-x-6 gap-y-2"
          style="grid-template-columns: max-content auto"
        >
          <div class="font-bold col1">TIR Method</div>
          <div class="col2">
            {{ fetchedTIR.method }}
          </div>

          <div class="font-bold col1">TIR Method Protocol</div>
          <div class="col2">
            {{ fetchedTIR.methodProtocol }}
          </div>

          <div v-if="fetchedTIRIsTezos" class="font-bold col1">Owner</div>
          <div v-if="fetchedTIRIsTezos" class="col2">
            {{ (fetchedTIR as ExpandableTezosTIR).owner }}
          </div>
          <Separator class="col-span-2" />
          <div class="font-bold col1">TIR2023 Protocol</div>
          <div class="col2">{{ fetchedTIR.protocol }}</div>
          <div class="font-bold col1">Issuer</div>
          <div class="col2">{{ fetchedTIR.issuer }}</div>
          <div class="font-bold col1">Last Updated</div>
          <div class="col2">{{ fetchedTIR.lastUpdated }}</div>
          <div class="font-bold col1">TTL</div>
          <div class="col2">{{ fetchedTIR.ttl }}</div>
          <div class="font-bold col1">Extra Metadata</div>
          <div class="col2">{{ fetchedTIR.extraMetadata ?? 'null' }}</div>
        </div>
        <div class="mb-8"></div>
        <!-- Issuers -->
        <Card class="w-full mb-2" v-for="issuer in entries">
          <CardHeader class="flex-row justify-between items-center">
            <CardTitle class="flex flex-row items-center gap-4">
              {{ issuer.id }}
              <div
                v-if="issuer.revoked == true"
                class="text-white bg-red-600 py-1 px-2 rounded-xl text-sm font-bold"
              >
                Revoked
              </div>
            </CardTitle>
            <div>
              <!-- Expand-Button, show only if there the TIR can expand issuers and the issuer is not expanded yet -->
              <Button
                v-if="
                  tzOwner != undefined &&
                  fetchedTIR != undefined &&
                  fetchedTIR.expandedIssuerIds?.indexOf(issuer.id) == -1
                "
                variant="outline"
                class="py-0 px-3 mr-2"
                @click="expandIssuerById(issuer.id)"
              >
                <Expand class="w-4 h-4 mr-2" />
                Expand
              </Button>
              <!-- Update-/Edit-Button, show only when the issuer is fully loaded -->
              <Button
                v-if="
                  fetchedTIR == undefined || fetchedTIR.expandedIssuerIds?.indexOf(issuer.id) != -1
                "
                :disabled="!showTezosButtons"
                variant="outline"
                class="aspect-square p-0 mr-2"
                @click="updateIssuer(issuer)"
              >
                <Pencil class="w-4 h-4" />
              </Button>
              <!-- Delete Button, can be shown always (when logged in & Tezos TIR) because the only required field, id, is always known -->
              <Button
                :disabled="!showTezosButtons"
                variant="outline"
                class="aspect-square p-0"
                @click="
                  deleteIssuer(
                    issuer.id,
                    () => {
                      entries = entries.filter((e) => e.id != issuer.id)
                    },
                    (_) => {}
                  )
                "
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <!-- Other fields -->
          <!-- Show them only if the issuer has been expanded -->
          <CardContent
            v-if="
              fetchedTIR == undefined || fetchedTIR?.expandedIssuerIds?.indexOf(issuer.id) != -1
            "
          >
            <IssuerComponent :issuer="issuer" />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
    <Card>
      <pre class="m-6 whitespace-pre-wrap" v-if="fetchedTIR != null">{{ storageString }}</pre>
    </Card>
  </div>
</template>
