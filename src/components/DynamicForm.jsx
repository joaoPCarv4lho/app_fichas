import { leResposta } from '../lib/resposta.js'

// Renderiza uma ficha a partir do schema (src/data/fichaSchemas.js).
// value: objeto { [campoId]: resposta }. onChange(novoValue).

export default function DynamicForm({ schema, value, onChange }) {
  const set = (id, v) => onChange({ ...value, [id]: v })

  return (
    <div>
      {schema.secoes.map((secao) => (
        <div key={secao.titulo}>
          <div className="section-title">{secao.titulo}</div>
          <div className="card">
            {secao.campos.map((campo) => (
              <Campo key={campo.id} campo={campo} value={value[campo.id]} onChange={(v) => set(campo.id, v)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Campo({ campo, value, onChange }) {
  const { tipo, label } = campo

  if (tipo === 'sim_nao') {
    const resp = leResposta(value) // aceita formato antigo
    const detalhe = value?.detalhe ?? ''
    const setResp = (r) => onChange(campo.detalheSe ? { resp: r, detalhe } : r)
    const showDetalhe = campo.detalheSe && resp === campo.detalheSe
    return (
      <div className="field">
        <label>{label}</label>
        <div className="simnao">
          <button type="button" className={resp === 'sim' ? 'on-sim' : ''} onClick={() => setResp(resp === 'sim' ? null : 'sim')}>Sim</button>
          <button type="button" className={resp === 'nao' ? 'on-nao' : ''} onClick={() => setResp(resp === 'nao' ? null : 'nao')}>Não</button>
        </div>
        {showDetalhe && (
          <input type="text" style={{ marginTop: 8 }} placeholder={campo.detalheLabel || 'Detalhe'}
            value={detalhe} onChange={(e) => onChange({ resp, detalhe: e.target.value })} />
        )}
      </div>
    )
  }

  if (tipo === 'select') {
    return (
      <div className="field">
        <label>{label}</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione…</option>
          {campo.opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }

  if (tipo === 'multi') {
    const arr = Array.isArray(value) ? value : []
    const toggle = (o) => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])
    return (
      <div className="field">
        <label>{label}</label>
        <div className="chips">
          {campo.opcoes.map((o) => (
            <button type="button" key={o} className={'chip' + (arr.includes(o) ? ' on' : '')} onClick={() => toggle(o)}>{o}</button>
          ))}
        </div>
      </div>
    )
  }

  if (tipo === 'textarea') {
    return (
      <div className="field">
        <label>{label}</label>
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} />
      </div>
    )
  }

  if (tipo === 'numero') {
    return (
      <div className="field">
        <label>{label}</label>
        <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      </div>
    )
  }

  // texto (padrão)
  return (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
