import test from 'node:test'
import assert from 'node:assert/strict'
import { exigeLinhas } from './linhas.js'

test('exigeLinhas: lança SEM_LINHAS para null, undefined e lista vazia', () => {
  for (const v of [null, undefined, []]) {
    assert.throws(() => exigeLinhas(v), (e) => e.code === 'SEM_LINHAS')
  }
})
test('exigeLinhas: aceita pelo menos uma linha', () => {
  assert.doesNotThrow(() => exigeLinhas([{ id: 1 }]))
})
