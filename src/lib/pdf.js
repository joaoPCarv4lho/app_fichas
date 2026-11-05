import { jsPDF } from 'jspdf'
import { leResposta } from './resposta.js'

// Gera e baixa um PDF da ficha de anamnese preenchida.
export function gerarPdfAnamnese(cliente, anamnese, schema) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  const width = doc.internal.pageSize.getWidth()
  const maxW = width - margin * 2
  let y = margin

  const linha = (h = 16) => {
    y += h
    if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin }
  }
  const texto = (txt, { size = 10, bold = false, color = '#2e2a2b', gap = 14 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(color)
    const linhas = doc.splitTextToSize(String(txt), maxW)
    for (const l of linhas) { doc.text(l, margin, y); linha(gap) }
  }

  // Cabeçalho
  doc.setFillColor('#b76e79')
  doc.rect(0, 0, width, 8, 'F')
  texto('Ficha de Anamnese', { size: 18, bold: true, gap: 22 })
  texto(`${schema.emoji ? '' : ''}${schema.titulo}`, { size: 12, bold: true, color: '#9c5560', gap: 20 })

  // Dados da cliente
  texto(`Cliente: ${cliente.nome}`, { bold: true })
  if (cliente.nascimento) texto(`Nascimento: ${dataBR(cliente.nascimento)}`)
  if (cliente.whatsapp) texto(`WhatsApp: ${cliente.whatsapp}`)
  texto(`Atualizada em: ${dataBR(anamnese.updated_at)}`)
  linha(8)

  // Respostas por seção
  for (const secao of schema.secoes) {
    texto(secao.titulo.toUpperCase(), { size: 11, bold: true, color: '#b76e79', gap: 16 })
    for (const campo of secao.campos) {
      const resp = formata(campo, anamnese.respostas?.[campo.id])
      if (resp === '') continue
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor('#2e2a2b')
      const label = doc.splitTextToSize(campo.label, maxW)
      for (const l of label) { doc.text(l, margin, y); linha(13) }
      texto(resp, { color: '#555', gap: 15 })
    }
    linha(4)
  }

  // Consentimento
  if (anamnese.consent_texto) {
    linha(4)
    texto('CONSENTIMENTO', { size: 11, bold: true, color: '#b76e79', gap: 16 })
    texto(anamnese.consent_texto, { size: 9, color: '#555', gap: 12 })
  }

  // Assinatura
  if (anamnese.consent_assinatura) {
    linha(10)
    if (y > doc.internal.pageSize.getHeight() - 140) { doc.addPage(); y = margin }
    try { doc.addImage(anamnese.consent_assinatura, 'PNG', margin, y, 200, 80) } catch { /* ignora */ }
    y += 88
    doc.setDrawColor('#999'); doc.line(margin, y, margin + 200, y)
    linha(12)
    texto(`${cliente.nome}`, { size: 9, color: '#777', gap: 12 })
    if (anamnese.consent_data) texto(`Assinado em ${dataBR(anamnese.consent_data)}`, { size: 9, color: '#777' })
  }

  doc.save(`Ficha-${slug(cliente.nome)}-${schema.key}.pdf`)
}

function formata(campo, valor) {
  if (valor == null || valor === '') return ''
  if (campo.tipo === 'sim_nao') {
    const resp = leResposta(valor)
    if (!resp) return ''
    const base = resp === 'sim' ? 'Sim' : 'Não'
    const det = campo.detalheSe && resp === campo.detalheSe ? valor?.detalhe : ''
    return det ? `${base} — ${det}` : base
  }
  if (campo.tipo === 'multi') return Array.isArray(valor) && valor.length ? valor.join(', ') : ''
  return String(valor)
}

function dataBR(iso) { if (!iso) return ''; const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso); return d.toLocaleDateString('pt-BR') }
function slug(s = '') { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') }
