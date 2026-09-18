// Testa se o .env está preenchido e se o banco (tabelas) foi criado.
// Uso: npm run check:db
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function lerEnv() {
  const out = {}
  try {
    for (const linha of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
  } catch { /* sem .env */ }
  return out
}

const env = lerEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

console.log('\n🔍 Verificando configuração do Supabase...\n')

if (!url || url.includes('SEU-PROJETO')) {
  console.log('❌ Falta o VITE_SUPABASE_URL no arquivo .env')
  process.exit(1)
}
if (!key || key.includes('sua-anon-key')) {
  console.log('❌ Falta o VITE_SUPABASE_ANON_KEY no arquivo .env')
  process.exit(1)
}
console.log('✅ .env preenchido')
console.log('   URL:', url)

const supabase = createClient(url, key)

// 1) conexão básica
try {
  const { error } = await supabase.from('clientes').select('id').limit(1)
  if (error && error.code === '42P01') {
    console.log('\n⚠️  Conectou no projeto, mas as TABELAS ainda não existem.')
    console.log('   Rode o supabase/schema.sql no SQL Editor do Supabase.')
    process.exit(1)
  }
  if (error && !/row-level security|permission|JWT/i.test(error.message)) {
    console.log('\n❌ Erro ao consultar:', error.message)
    process.exit(1)
  }
  console.log('✅ Conexão OK e tabela "clientes" existe')
} catch (e) {
  console.log('\n❌ Não consegui conectar. Confira a URL/chave.')
  console.log('   Detalhe:', e.message)
  process.exit(1)
}

// 2) bucket de fotos
try {
  const { data, error } = await supabase.storage.getBucket('fotos')
  if (error || !data) console.log('⚠️  Bucket "fotos" não encontrado (o schema.sql cria ele). Verifique se rodou tudo.')
  else console.log('✅ Bucket de fotos "fotos" existe')
} catch {
  console.log('⚠️  Não deu pra checar o bucket de fotos (pode ser normal). Siga em frente.')
}

console.log('\n🎉 Tudo certo! Rode "npm run dev" e crie sua conta no app.\n')
