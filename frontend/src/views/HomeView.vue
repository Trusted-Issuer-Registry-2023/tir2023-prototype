<script setup lang="ts">
/**
 * This is the home page at the root path.
 * It contains a short description of the project and links to the registry and verify pages.
 */
import { RouterLink } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import IconGithub from '@/components/icons/IconGithub.vue'
</script>

<template>
  <section class="flex max-w-[980px] flex-col items-start gap-2 px-4 pt-8 md:pt-12 pb-8">
    <h1 class="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
      Manage your Trusted Issuer Registry.
    </h1>

    <p class="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
      TIR-Connect is your easy interface to Trusted Issuer Registries, especially those deployed on
      Tezos. You can view all issuers, register a new one, delete issuers, and verify a Verifiable
      Credential issuers.
    </p>

    <div class="flex w-full items-center space-x-4 pb-8 pt-4 md:pb-10">
      <RouterLink to="/registry"> <Button>Get Started </Button> </RouterLink>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://github.com/Trusted-Issuer-Registry-2023/tir2023-prototype"
      >
        <Button variant="outline">
          <IconGithub class="mr-2 h-4 w-4" />
          GitHub
        </Button></a
      >
    </div>

    <Card class="p-2 mt-4 max-w-[750px]">
      <CardHeader><CardTitle>How to start</CardTitle></CardHeader>
      <CardContent>
        <p class="text-lg text-muted-foreground sm:text-xl">
          Start with entering a TIR DID in the navigation bar. You can now see the TIR's contents at
          "Registry" or verify an issuer at "Verify". In case you entered a Tezos TIR and want to
          make changes to it, you have to connect your Tezos wallet first.
        </p>
      </CardContent>
    </Card>
  </section>
</template>
