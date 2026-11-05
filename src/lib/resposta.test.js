import test from 'node:test'
import assert from 'node:assert/strict'
import { leResposta } from './resposta.js'

test('string antiga sim/nao', () => {
  assert.equal(leResposta('sim'), 'sim')
  assert.equal(leResposta('nao'), 'nao')
})
test('objeto com resp', () => {
  assert.equal(leResposta({ resp: 'sim', detalhe: 'x' }), 'sim')
})
test('resp nula com detalhe => null (bug G4)', () => {
  assert.equal(leResposta({ resp: null, detalhe: 'x' }), null)
})
test('undefined e null => null', () => {
  assert.equal(leResposta(undefined), null)
  assert.equal(leResposta(null), null)
})
