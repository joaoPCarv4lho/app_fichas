import { useMemo } from 'react'
import { mensagemDeErro } from '../lib/erros.js'

// Aviso de falha ao carregar uma tela + botão para repetir. `erro` é o erro real.
export default function ErroCarga({ erro, onRetry }) {
  const mensagem = useMemo(() => mensagemDeErro(erro), [erro]) // registra no console só uma vez por erro
  return (
    <>
      <div className="notice" role="alert">{mensagem}</div>
      <button type="button" className="btn secondary" onClick={onRetry}>Tentar de novo</button>
    </>
  )
}
