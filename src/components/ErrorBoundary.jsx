import { Component } from 'react'

// Captura erros de renderização. Não pega erros de handlers/async (limitação do React).
export default class ErrorBoundary extends Component {
  state = { erro: false }
  static getDerivedStateFromError() { return { erro: true } }
  componentDidCatch(e, info) { console.error(e, info?.componentStack) }
  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="app">
        <div className="content" role="alert">
          <h2>Algo deu errado</h2>
          <p className="muted">Ocorreu um problema inesperado. Recarregue a página para continuar.</p>
          <button type="button" className="btn" onClick={() => location.reload()}>Recarregar</button>
        </div>
      </div>
    )
  }
}
