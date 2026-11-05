import test from 'node:test'
import assert from 'node:assert/strict'
import { mensagemDeErro } from './erros.js'

const GENERICA = 'Não foi possível concluir. Tente de novo.'
const msg = (t, e) => {
  t.mock.method(console, 'error', () => {})
  return mensagemDeErro(e)
}

test('sem conexão: TypeError Failed to fetch', (t) => {
  assert.match(msg(t, new TypeError('Failed to fetch')), /Sem conexão/)
})
test('sem conexão: navigator offline', (t) => {
  const orig = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true })
  try {
    assert.match(msg(t, new Error('x')), /Sem conexão/)
  } finally {
    if (orig) Object.defineProperty(globalThis, 'navigator', orig)
    else delete globalThis.navigator
  }
})
test('sessão expirada: status 401, JWT expired, PGRST301', (t) => {
  assert.match(msg(t, { status: 401, message: 'x' }), /sessão expirou/)
  assert.match(msg(t, new Error('JWT expired')), /sessão expirou/)
  assert.match(msg(t, { code: 'PGRST301' }), /sessão expirou/)
})
test('permissão: 42501 e row-level security', (t) => {
  assert.match(msg(t, { code: '42501', message: 'x' }), /permissão/)
  assert.match(msg(t, new Error('new row violates row-level security policy')), /permissão/)
})
test('duplicado: 23505', (t) => {
  assert.equal(msg(t, { code: '23505', message: 'duplicate key' }), 'Já existe um registro igual.')
})
test('qualquer outro, sem texto cru', (t) => {
  assert.equal(msg(t, new Error('relation "x" does not exist')), GENERICA)
  assert.equal(msg(t, undefined), GENERICA)
  assert.equal(msg(t, 'algo cru'), GENERICA)
  assert.equal(msg(t, {}), GENERICA)
})
test('registra o erro no console', (t) => {
  const m = t.mock.method(console, 'error', () => {})
  mensagemDeErro(new Error('boom'))
  assert.equal(m.mock.callCount(), 1)
})
test('registro não encontrado: PGRST116', (t) => {
  assert.equal(msg(t, { code: 'PGRST116', message: 'x' }), 'Registro não encontrado.')
})
test('nenhuma linha afetada: SEM_LINHAS', (t) => {
  assert.match(msg(t, { code: 'SEM_LINHAS', message: 'x' }), /não tem permissão ou o registro não existe mais/)
})
