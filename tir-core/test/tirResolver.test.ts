import { TezosToolkit } from '@taquito/taquito'
import { TIRResolver } from '../src/tirResolver'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
// @ts-expect-error
global.TextDecoder = TextDecoder

describe('DID recognition', () => {
  it('works', () => {
    let resolver = new TIRResolver(new TezosToolkit('https://ghostnet.tezos.marigold.dev'))
    const correctDids = ['did:web:example.com', 'did:tz:tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx']
    const incorrectDids = ['', 'asdf', 'https://example.com']
    for (let did of correctDids) {
      expect(resolver.isDid(did)).toBeTruthy()
    }
    for (let did of incorrectDids) {
      expect(resolver.isDid(did)).toBeFalsy()
    }
  })
})
