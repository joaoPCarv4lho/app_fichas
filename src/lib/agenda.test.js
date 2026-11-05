import test from 'node:test'
import assert from 'node:assert/strict'
import { hojeISO, addDias, fimDe, conflita, idadeDe, cruzaMeiaNoite } from './agenda.js'

test('hojeISO usa a data local, não UTC', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 10, 5, 23, 30).getTime() })
  assert.equal(hojeISO(), '2026-11-05')
})

test('addDias: virada de mês, de ano, ida e volta, 29/02', () => {
  assert.equal(addDias('2026-01-31', 1), '2026-02-01')
  assert.equal(addDias('2026-12-31', 1), '2027-01-01')
  assert.equal(addDias('2027-01-01', -1), '2026-12-31')
  assert.equal(addDias(addDias('2026-11-05', 40), -40), '2026-11-05')
  assert.equal(addDias('2028-02-28', 1), '2028-02-29')
  assert.equal(addDias('2028-02-29', 1), '2028-03-01')
})

test('fimDe', () => {
  assert.equal(fimDe('09:00', 60), '10:00')
  assert.equal(fimDe('23:30', 60), '00:30')
})

test('conflita', () => {
  const a = { data: '2026-11-05', hora: '09:00', duracao_min: 60 }
  assert.equal(conflita(a, { data: '2026-11-05', hora: '09:30', duracao_min: 30 }), true)
  assert.equal(conflita(a, { data: '2026-11-05', hora: '10:00', duracao_min: 30 }), false)
  assert.equal(conflita(a, { data: '2026-11-05', hora: '08:00', duracao_min: 60 }), false)
  assert.equal(conflita(a, { data: '2026-11-06', hora: '09:00', duracao_min: 60 }), false)
  assert.equal(conflita(a, { data: '2026-11-05', hora: '09:30' }), true)
  assert.equal(conflita({ data: '2026-11-05', hora: '09:00' }, { data: '2026-11-05', hora: '09:00' }), false)
})

test('idadeDe', () => {
  assert.equal(idadeDe('1990-11-05', '2026-11-05'), 36)
  assert.equal(idadeDe('1990-11-06', '2026-11-05'), 35)
  assert.equal(idadeDe('1990-11-04', '2026-11-05'), 36)
  assert.equal(idadeDe('2000-02-29', '2025-02-28'), 24)
  assert.equal(idadeDe('2000-02-29', '2025-03-01'), 25)
  assert.equal(idadeDe('2000-02-29', '2028-02-28'), 27)
  assert.equal(idadeDe('2000-02-29', '2028-02-29'), 28)
  assert.equal(idadeDe('', '2026-11-05'), null)
  assert.equal(idadeDe(null, '2026-11-05'), null)
  assert.equal(idadeDe('lixo', '2026-11-05'), null)
})

test('cruzaMeiaNoite', () => {
  assert.equal(cruzaMeiaNoite('22:30', 60), false)
  assert.equal(cruzaMeiaNoite('23:30', 60), true)
  assert.equal(cruzaMeiaNoite('23:00', 60), false)
})
