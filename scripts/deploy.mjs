// Deploy manual na Vercel. Uso: npm run deploy -- --prod
// Sem --prod só imprime o plano e não executa nada. Só rode com --prod com autorização explícita.
import { execFileSync } from 'node:child_process'
import { copyFileSync } from 'node:fs'

const passos = [
  ['npm run check', () => run('npm', ['run', 'check'])],
  ['copiar vercel.json para dist/', () => copyFileSync('vercel.json', 'dist/vercel.json')],
  ['npx vercel link --yes --project dist --scope jp-828d', () => run('npx', ['vercel', 'link', '--yes', '--project', 'dist', '--scope', 'jp-828d'])],
  ['npx vercel deploy --prod --yes', () => run('npx', ['vercel', 'deploy', '--prod', '--yes'])]
]

// npm/npx são .cmd no Windows: precisam de shell.
function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', cwd: cmd === 'npx' ? 'dist' : undefined })
}

if (!process.argv.includes('--prod')) {
  console.log('Plano do deploy (nada foi executado; use "npm run deploy -- --prod" com autorização):')
  passos.forEach(([nome], i) => console.log(`  ${i + 1}. ${nome}`))
  process.exit(0)
}

for (const [nome, fn] of passos) {
  console.log(`\n==> ${nome}`)
  fn()
}
