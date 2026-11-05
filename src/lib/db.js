import { supabase } from './supabase.js'
import { exigeLinhas } from './linhas.js'

async function uid() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id
}

// ---------- Clientes ----------
export async function listClientes() {
  const { data, error } = await supabase
    .from('clientes').select('*').order('nome')
  if (error) throw error
  return data
}

export async function getCliente(id) {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function saveCliente(cliente) {
  const payload = { ...cliente }
  payload.user_id = await uid()
  const { data, error } = await supabase.from('clientes').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteCliente(id) {
  const { data, error } = await supabase.from('clientes').delete().eq('id', id).select('id')
  if (error) throw error
  exigeLinhas(data)
}

// ---------- Anamneses ----------
export async function getAnamneses(clienteId) {
  const { data, error } = await supabase.from('anamneses').select('*').eq('cliente_id', clienteId)
  if (error) throw error
  return data
}

export async function getAnamnese(clienteId, tipo) {
  const { data, error } = await supabase
    .from('anamneses').select('*').eq('cliente_id', clienteId).eq('tipo', tipo).maybeSingle()
  if (error) throw error
  return data
}

export async function saveAnamnese(anamnese) {
  const payload = { ...anamnese, updated_at: new Date().toISOString() }
  payload.user_id = await uid()
  const { data, error } = await supabase
    .from('anamneses')
    .upsert(payload, { onConflict: 'cliente_id,tipo' })
    .select().single()
  if (error) throw error
  return data
}

// ---------- Atendimentos ----------
export async function listAtendimentos(clienteId) {
  const { data, error } = await supabase
    .from('atendimentos').select('*').eq('cliente_id', clienteId).order('data', { ascending: false })
  if (error) throw error
  return data
}

export async function getAtendimento(id) {
  const { data, error } = await supabase.from('atendimentos').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function saveAtendimento(at) {
  const payload = { ...at }
  payload.user_id = await uid()
  const { data, error } = await supabase.from('atendimentos').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function deleteAtendimento(id) {
  const { data, error } = await supabase.from('atendimentos').delete().eq('id', id).select('id')
  if (error) throw error
  exigeLinhas(data)
}

// ---------- Agendamentos ----------
export async function listAgendamentos({ de, ate, dia, status } = {}) {
  let q = supabase.from('agendamentos').select('*, cliente:clientes(id,nome,whatsapp)')
  if (dia) q = q.eq('data', dia)
  if (de) q = q.gte('data', de)
  if (ate) q = q.lte('data', ate)
  if (status) q = q.in('status', status)
  const { data, error } = await q.order('data').order('hora')
  if (error) throw error
  return data
}

export async function getAgendamento(id) {
  const { data, error } = await supabase
    .from('agendamentos').select('*, cliente:clientes(id,nome,whatsapp)').eq('id', id).single()
  if (error) throw error
  return data
}

export async function saveAgendamento(ag) {
  const payload = { ...ag }
  delete payload.cliente // campo derivado do join, não é coluna
  payload.user_id = await uid()
  const { data, error } = await supabase.from('agendamentos').upsert(payload).select().single()
  if (error) throw error
  return data
}

export async function setStatusAgendamento(id, status) {
  const { data, error } = await supabase.from('agendamentos').update({ status }).eq('id', id).select('id')
  if (error) throw error
  exigeLinhas(data)
}

// Atualização parcial (ex.: vincular atendimento + marcar realizado)
export async function patchAgendamento(id, fields) {
  const { data, error } = await supabase.from('agendamentos').update(fields).eq('id', id).select('id')
  if (error) throw error
  exigeLinhas(data)
}

export async function deleteAgendamento(id) {
  const { data, error } = await supabase.from('agendamentos').delete().eq('id', id).select('id')
  if (error) throw error
  exigeLinhas(data)
}

// ---------- Fotos (Storage) ----------
export async function uploadFoto(blob, momento) {
  const id = await uid()
  const path = `${id}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('fotos').upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return { path, momento }
}

export async function signedUrl(path, expires = 3600) {
  const { data, error } = await supabase.storage.from('fotos').createSignedUrl(path, expires)
  if (error) return null
  return data.signedUrl
}

export async function removeFoto(path) {
  await supabase.storage.from('fotos').remove([path])
}
