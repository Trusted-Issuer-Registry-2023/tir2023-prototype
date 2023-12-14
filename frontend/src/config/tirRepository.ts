/**
 * TIR repository
 * Contains utility functions for smart contract interaction.
 * - Update, delete and register issuers.
 * - Set metadata.
 */
import { TIRResolver } from 'tir-core'

import { useToast } from '@/components/ui/toast'
import { tezos, tirDid } from '@/config/state'
import { showOnlyOnTezosDialog } from '@/utils/commonDialogs'
import type { EditIssuer } from '@/views/registry/IssuerEditComponent.vue'
import type { TezosToolkit, TransactionWalletOperation } from '@taquito/taquito'

const { toast } = useToast()

async function getContractAddress(did: string) {
  const resolver = new TIRResolver(tezos.value as TezosToolkit)
  const contractAddress = await resolver.getAddressByDid(did)
  return contractAddress
}

export async function setMetadata(
  ttl: number,
  extraMetadata: string,
  onSend: () => void,
  setIsLoading: (isLoading: boolean) => void
) {
  if (tirDid.value == undefined) {
    return
  }

  console.log('Updating Metadata. TTL: ', ttl, ' Extra Metadata: ', extraMetadata)
  setIsLoading(true)
  const contractAddress = await getContractAddress(tirDid.value)

  if (contractAddress?.type != 'tezos') {
    showOnlyOnTezosDialog()
    return
  }

  let transaction = tezos.value.wallet.at(contractAddress.address).then((contract) => {
    return contract.methods.setMetadata(ttl, extraMetadata).send()
  })

  handleWalletTransaction(transaction, onSend, setIsLoading)
}

export async function deleteIssuer(
  id: string,
  onSend: () => void,
  setIsLoading: (isLoading: boolean) => void
) {
  if (tirDid.value == undefined) {
    return
  }

  console.log('Deleting issuer: ', id)
  setIsLoading(true)
  const contractAddress = await getContractAddress(tirDid.value)

  if (contractAddress?.type != 'tezos') {
    showOnlyOnTezosDialog()
    return
  }

  let transaction = tezos.value.wallet.at(contractAddress.address).then((contract) => {
    return contract.methods.deleteIssuerById(id).send()
  })
  handleWalletTransaction(transaction, onSend, setIsLoading)
}

export async function registerIssuer(
  issuer: EditIssuer,
  onSend: () => void,
  setIsLoading: (isLoading: boolean) => void
) {
  if (tirDid.value == undefined) {
    return
  }

  console.log('Registering issuer: ', issuer.id)
  setIsLoading(true)
  const contractAddress = await getContractAddress(tirDid.value)

  if (contractAddress?.type != 'tezos') {
    showOnlyOnTezosDialog()
    return
  }
  let transaction = tezos.value.wallet.at(contractAddress.address).then((contract) => {
    return contract.methods
      .addIssuer(
        issuer.id,
        issuer.trustedSince == '' ? null : issuer.trustedSince,
        issuer.trustedUntil == '' ? null : issuer.trustedUntil,
        issuer.revoked == 'null' ? null : issuer.revoked == 'true',
        issuer.tcDescription == '' ? null : issuer.tcDescription,
        issuer.tcIdentity == '' ? null : issuer.tcIdentity,
        issuer.credentialSchemas.length == 0 ? null : issuer.credentialSchemas
      )
      .send()
  })
  handleWalletTransaction(transaction, onSend, setIsLoading)
}

export async function updateIssuer(
  issuer: EditIssuer,
  onSend: () => void,
  setIsLoading: (isLoading: boolean) => void
) {
  if (tirDid.value == undefined) {
    return
  }

  console.log('Updating issuer: ', issuer.id)
  setIsLoading(true)
  const contractAddress = await getContractAddress(tirDid.value)

  if (contractAddress?.type != 'tezos') {
    showOnlyOnTezosDialog()
    return
  }

  let transaction = tezos.value.wallet.at(contractAddress.address).then((contract) => {
    return contract.methods
      .updateIssuer(
        issuer.id,
        issuer.trustedSince,
        issuer.trustedUntil,
        issuer.revoked == 'null' ? null : issuer.revoked == 'true',
        issuer.tcDescription,
        issuer.tcIdentity,
        issuer.credentialSchemas.length == 0 ? null : issuer.credentialSchemas
      )
      .send()
  })
  handleWalletTransaction(transaction, onSend, setIsLoading)
}

// Helper function to handle wallet transactions
// Waits for the transaction to be confirmed and shows a toast message on success or error
function handleWalletTransaction(
  transaction: Promise<TransactionWalletOperation>,
  onSend: () => void,
  setIsLoading: (isLoading: boolean) => void
) {
  transaction
    .then(
      async (op) => {
        // clear form
        onSend()

        console.log(`Waiting for ${op.opHash} to be confirmed...`)
        toast({ title: 'Operation was accpeted by the node. Awaiting confirmation...' })
        await op.confirmation(3)
        return op.opHash
      },
      (error) => {
        throw error
      }
    )
    .then(
      (hash) => {
        setIsLoading(false)
        console.log(`Operation injected: https://ghost.tzstats.com/${hash}`)
        toast({
          title: 'Operation was successfully injected.',
          description: 'The operation was confirmed by the blockchain.'
        })
      },
      (error) => {
        throw error
      }
    )
    .catch((error) => {
      setIsLoading(false)
      console.log(`Error: ${JSON.stringify(error, null, 2)}`)
      if (error.name == 'UnknownBeaconError') {
        toast({
          variant: 'destructive',
          title: 'Beacon Error: ' + error.title,
          description: error.description
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'An error occurred.',
          description: 'The operation could not be completed.'
        })
      }
    })
}
