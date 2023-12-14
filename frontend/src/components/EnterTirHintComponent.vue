<script lang="ts" setup>
/**
 * A component that hints the user to enter a TIR DID in case it is empty
 * Does fade in and out when the TIR DID becomes empty or not empty
 */
import { tirDid } from '@/config/state'
</script>

<template>
  <!-- Hint the user to enter a TIR DID in case it is empty -->
  <div
    class="transition-all overflow-hidden"
    :style="
      tirDid == '' || tirDid == undefined ? 'opacity: 1; height: auto;' : 'opacity: 0; height: 0'
    "
  >
    <div class="mb-4 font-bold text-white p-2 primary-bg">
      Please specify the DID of a Trusted Issuer Registry in the navigation bar first.
    </div>
  </div>
</template>

<style>
.primary-bg {
  background-color: var(--my-primary-color);
}
</style>
