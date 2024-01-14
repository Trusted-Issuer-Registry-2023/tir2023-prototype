/**
 * This file contains all the global state variables that are used in the application.
 */
import { ref } from 'vue'

import { Configuration, DefaultApi, type ExpandableTIR } from '@/api'
import type { EditIssuer } from '@/views/registry/IssuerEditComponent.vue'
import type { BeaconWallet } from '@taquito/beacon-wallet'
import { TezosToolkit } from '@taquito/taquito'

const rpcUrl = import.meta.env.VITE_TEZOS_RPC_URL as string
const basePath = import.meta.env.VITE_API_BASE_PATH as string

export const api = ref<DefaultApi>(new DefaultApi(new Configuration({basePath: basePath})))
export const tezos = ref<TezosToolkit>(new TezosToolkit(rpcUrl))
export const wallet = ref<BeaconWallet>()

export const fetchedTIR = ref<null | ExpandableTIR>(null) // in-memory cache of the TIR

export const isConnected = ref<boolean>(false) // Whether the user is connected with a wallet
export const currTzAddr = ref<string>() // The current Tezos address of the user if connected, else undefined
export const tirDid = ref<string>() // The TIR DID that is input in the navigation bar
export const isLoadingGlobal = ref<boolean>(false) // Whether the application is currently loading something
export const activeRegistryTab = ref<string>('registry') // The currently active tab in the registry management view, allows to switch between the tabs
// Value of the issuer that is currently edited in the issuer edit view
// Allows to set the issuer value from the RegistryView
export const updateIssuerValue = ref<EditIssuer>({
  id: '',
  trustedSince: new Date().toISOString(),
  trustedUntil: '',
  revoked: 'null',
  tcDescription: '',
  tcIdentity: '',
  credentialSchemas: []
})
// If the TIR is a Tezos TIR, this is the contracts owner, else undefined
export const tzOwner = ref<string>()
