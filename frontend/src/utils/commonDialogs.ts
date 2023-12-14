/**
 * Common dialogs used in multiple places
 */
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

export function showOnlyOnTezosDialog() {
  toast({
    variant: 'destructive',
    title: 'No Tezos contract found',
    description:
      'The DID does not resolve to a Tezos smart contract. This feature only works for TIRs on Tezos.'
  })
}
