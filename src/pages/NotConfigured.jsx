export default function NotConfigured() {
  return (
    <div className="app">
      <div className="topbar" style={{ paddingLeft: 16 }}><h1>Configuração</h1></div>
      <div className="content">
        <div className="auth-box" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="logo">🔧</div>
          <h2>Falta conectar o Supabase</h2>
          <p className="muted center">O app está instalado, mas ainda não sabe onde guardar os dados.</p>
          <div className="card">
            <p><strong>1.</strong> Crie uma conta grátis em <strong>supabase.com</strong> e um novo projeto.</p>
            <p><strong>2.</strong> No projeto, abra <strong>SQL Editor</strong>, cole o conteúdo do arquivo <code>supabase/schema.sql</code> e clique em <strong>Run</strong>.</p>
            <p><strong>3.</strong> Em <strong>Project Settings → API</strong>, copie a <em>Project URL</em> e a <em>anon public key</em>.</p>
            <p><strong>4.</strong> Crie um arquivo <code>.env</code> na raiz do projeto (copie de <code>.env.example</code>) e cole os dois valores.</p>
            <p><strong>5.</strong> Rode <code>npm run dev</code> de novo.</p>
          </div>
          <p className="muted center" style={{ fontSize: 13 }}>Passo a passo completo no arquivo <code>README.md</code>.</p>
        </div>
      </div>
    </div>
  )
}
