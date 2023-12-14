/**
 * Wallet interaction functionality
 */
import { NetworkType } from '@airgap/beacon-types'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { TezosToolkit } from '@taquito/taquito'

async function getNewWallet() {
  return new (await import('@taquito/beacon-wallet')).BeaconWallet({
    name: 'TIR-Connect',
    network: { type: NetworkType.GHOSTNET }
  })
}

// Returns the existing wallet if it exists, otherwise creates a new one
export async function getWallet(
  wallet: BeaconWallet | undefined,
  setWallet: (wallet: BeaconWallet | undefined) => void,
  tezos: TezosToolkit
) {
  if (wallet) {
    return wallet
  } else {
    const newWallet = await getNewWallet()
    setWallet(newWallet)
    tezos.setWalletProvider(newWallet)
    return newWallet
  }
}

// Request permissions from the wallet
export async function requestRequiredPermissions(wallet: BeaconWallet) {
  try {
    console.log('Requesting permissions...')
    const permissions = await wallet.client.requestPermissions()
    console.log('Got permissions:', permissions.address)
    return permissions
  } catch (error) {
    console.error('Got error:', error)
  }
}
