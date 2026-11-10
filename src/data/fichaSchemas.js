// ============================================================================
//  CAMPOS DAS FICHAS DE ANAMNESE  —  EDITE À VONTADE
// ============================================================================
//
//  Este arquivo define as perguntas de cada ficha. Para ajustar:
//
//  • Mudar um texto de pergunta  -> altere o "label".
//  • Adicionar uma pergunta      -> copie um objeto { ... } e cole na seção.
//  • Remover uma pergunta        -> apague o objeto { ... } correspondente.
//  • Reordenar                   -> mova os objetos de lugar.
//
//  Tipos de campo disponíveis (campo "tipo"):
//    'sim_nao'    -> botões Sim / Não. Some "detalheSe: 'sim'" para pedir um
//                    detalhe em texto quando a resposta for Sim.
//    'texto'      -> uma linha de texto.
//    'textarea'   -> texto longo (várias linhas).
//    'numero'     -> número.
//    'select'     -> escolher UMA opção (defina "opcoes: [...]").
//    'multi'      -> escolher VÁRIAS opções (defina "opcoes: [...]").
//
//  O "id" precisa ser único dentro da ficha e não deve ser alterado depois de
//  já existirem fichas preenchidas (senão a resposta antiga "perde o vínculo").
// ============================================================================

export const FICHA_PELE = {
  key: 'pele',
  titulo: 'Limpeza de Pele / Dermaplaning',
  nome: 'Pele',
  emoji: '🧖',
  cor: '#b76e79',
  secoes: [
    {
      titulo: 'Saúde geral',
      campos: [
        { id: 'gestante', label: 'Está gestante ou amamentando?', tipo: 'sim_nao' },
        { id: 'medicamentos', label: 'Faz uso de medicamentos?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais?' },
        { id: 'alergias', label: 'Possui alergias (cosméticos, medicamentos, látex)?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais?' },
        { id: 'doencas', label: 'Possui alguma doença?', tipo: 'multi', opcoes: ['Diabetes', 'Hipertensão', 'Cardíaca', 'Autoimune', 'Epilepsia', 'Nenhuma'] },
        { id: 'tireoide', label: 'Distúrbio de tireoide ou hormonal?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Qual?' },
        { id: 'marcapasso', label: 'Usa marca-passo ou possui próteses metálicas?', tipo: 'sim_nao' },
        { id: 'herpes', label: 'Histórico de herpes labial/facial?', tipo: 'sim_nao' },
        { id: 'cicatrizacao', label: 'Cicatrização difícil ou tendência a queloide?', tipo: 'sim_nao' },
      ],
    },
    {
      titulo: 'Sobre a pele',
      campos: [
        { id: 'tipo_pele', label: 'Tipo de pele', tipo: 'select', opcoes: ['Oleosa', 'Seca', 'Mista', 'Normal', 'Sensível'] },
        { id: 'sensibilidade', label: 'Sensibilidade ou vermelhidão frequente?', tipo: 'sim_nao' },
        { id: 'acne', label: 'Possui acne ativa?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Grau/observações' },
        { id: 'acidos', label: 'Usa ácidos ou retinoides?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais e há quanto tempo?' },
        { id: 'procedimento_recente', label: 'Fez procedimento estético recente (peeling, laser, botox, preenchimento)?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Qual e quando?' },
        { id: 'sol', label: 'Exposição solar ou bronzeamento recente?', tipo: 'sim_nao' },
        { id: 'protetor', label: 'Usa protetor solar diariamente?', tipo: 'sim_nao' },
        { id: 'rotina', label: 'Rotina atual de skincare', tipo: 'textarea' },
      ],
    },
    {
      titulo: 'Dermaplaning',
      campos: [
        { id: 'derma_antes', label: 'Já fez dermaplaning antes?', tipo: 'sim_nao' },
        { id: 'pelos', label: 'Pelos faciais densos/grossos?', tipo: 'sim_nao' },
        { id: 'lesoes', label: 'Lesões ativas, verrugas ou pintas em relevo na área?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Onde?' },
      ],
    },
    {
      titulo: 'Observações',
      campos: [
        { id: 'obs', label: 'Observações adicionais', tipo: 'textarea' },
      ],
    },
  ],
}

export const FICHA_MANICURE = {
  key: 'manicure',
  titulo: 'Manicure (gel, alongamento, etc.)',
  nome: 'Manicure',
  emoji: '💅',
  cor: '#c9a227',
  secoes: [
    {
      titulo: 'Saúde geral',
      campos: [
        { id: 'diabetes', label: 'Possui diabetes?', tipo: 'sim_nao' },
        { id: 'circulacao', label: 'Problemas de circulação/vasculares?', tipo: 'sim_nao' },
        { id: 'alergias', label: 'Alergias (acrilato/gel/resina, acetona, látex, esmalte)?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais?' },
        { id: 'reacao_unha', label: 'Já teve reação a produto de unha (ardência, coceira, descolamento)?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Descreva' },
        { id: 'dermatite', label: 'Psoríase, dermatite ou eczema nas mãos?', tipo: 'sim_nao' },
        { id: 'micose', label: 'Micose/onicomicose (atual ou passada)?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Qual unha / quando?' },
        { id: 'gestante', label: 'Está gestante ou amamentando?', tipo: 'sim_nao' },
        { id: 'medicamentos', label: 'Uso de medicamentos (imunossupressor, isotretinoína, etc.)?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais?' },
        { id: 'tireoide', label: 'Distúrbio de tireoide?', tipo: 'sim_nao' },
      ],
    },
    {
      titulo: 'Sobre as unhas',
      campos: [
        { id: 'estado', label: 'Estado atual das unhas', tipo: 'multi', opcoes: ['Saudáveis', 'Fracas', 'Quebradiças', 'Onduladas', 'Roídas', 'Descolando'] },
        { id: 'ja_usou', label: 'Já usou gel, acrigel, fibra ou porcelana?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Teve alguma reação?' },
        { id: 'roer', label: 'Tem o hábito de roer unhas/cutículas?', tipo: 'sim_nao' },
        { id: 'unha_alterada', label: 'Alguma unha inflamada, descolada ou com micose?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Qual?' },
        { id: 'sensibilidade_lixa', label: 'Sensibilidade a lixa/dremel?', tipo: 'sim_nao' },
      ],
    },
    {
      titulo: 'Serviço',
      campos: [
        { id: 'servico_desejado', label: 'Serviço desejado', tipo: 'multi', opcoes: ['Esmaltação em gel', 'Alongamento (fibra)', 'Alongamento (gel)', 'Alongamento (molde)', 'Banho de gel', 'Manutenção', 'Remoção'] },
      ],
    },
    {
      titulo: 'Observações',
      campos: [
        { id: 'obs', label: 'Observações adicionais', tipo: 'textarea' },
      ],
    },
  ],
}

export const FICHA_DRENAGEM = {
  key: 'drenagem',
  titulo: 'Drenagem Linfática Manual',
  nome: 'Drenagem',
  emoji: '💧',
  cor: '#2f7a5c',
  secoes: [
    {
      titulo: 'Histórico de saúde',
      campos: [
        { id: 'condicoes', label: 'Possui alguma condição de saúde?', tipo: 'multi', opcoes: ['Hipertensão arterial', 'Diabetes', 'Problemas circulatórios/varizes', 'Trombose ou histórico de trombose', 'Problemas cardíacos', 'Problemas renais', 'Câncer (atual ou anterior)', 'Nenhuma'] },
        { id: 'condicoes_outros', label: 'Outras condições', tipo: 'texto' },
        { id: 'medicamentos', label: 'Faz uso de medicamentos?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais?' },
        { id: 'alergias', label: 'Possui alergias?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Quais?' },
        { id: 'gestante', label: 'Está gestante ou no pós-parto?', tipo: 'select', opcoes: ['Sim', 'Não', 'Não se aplica'] },
        { id: 'cirurgia', label: 'Realizou cirurgia recentemente?', tipo: 'sim_nao', detalheSe: 'sim', detalheLabel: 'Qual e quando?' },
        { id: 'inflamacao', label: 'Apresenta febre, infecção, feridas ou inflamação atualmente?', tipo: 'sim_nao' },
      ],
    },
    {
      titulo: 'Avaliação corporal',
      campos: [
        { id: 'objetivo', label: 'Objetivo da drenagem', tipo: 'multi', opcoes: ['Redução de edema/inchaço', 'Sensação de pernas pesadas', 'Pós-operatório (com liberação médica)', 'Bem-estar/relaxamento'] },
        { id: 'objetivo_outros', label: 'Outro objetivo', tipo: 'texto' },
        { id: 'regioes', label: 'Regiões a serem tratadas', tipo: 'multi', opcoes: ['Abdômen', 'Pernas', 'Braços', 'Corpo inteiro'] },
        { id: 'sinais_alerta', label: 'Apresenta dor, inchaço súbito ou assimétrico, vermelhidão ou calor em alguma região?', tipo: 'sim_nao' },
        { id: 'obs', label: 'Observações', tipo: 'textarea' },
      ],
    },
    {
      titulo: 'Registro do atendimento',
      campos: [
        { id: 'avaliacao', label: 'Avaliação', tipo: 'select', opcoes: ['Apto(a)', 'Necessita avaliação/liberação médica'] },
        { id: 'procedimento', label: 'Procedimento realizado', tipo: 'texto' },
      ],
    },
  ],
}

export const FICHAS = {
  pele: FICHA_PELE,
  manicure: FICHA_MANICURE,
  drenagem: FICHA_DRENAGEM,
}

// Lista das fichas (para seletores de tipo de serviço).
export const TIPOS = Object.values(FICHAS)

// Texto do termo de consentimento (LGPD). AJUSTE com seus dados / orientação
// jurídica. Use {NOME} para inserir o nome da cliente automaticamente.
export const TERMO_CONSENTIMENTO = `Eu, {NOME}, autorizo a realização do procedimento estético e declaro que as informações prestadas nesta ficha de anamnese são verdadeiras. Estou ciente de que a omissão de informações pode comprometer o resultado e a segurança do procedimento.

Autorizo, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018), a coleta e o tratamento dos meus dados pessoais e de saúde aqui informados, exclusivamente para fins de registro e acompanhamento do meu atendimento. Estou ciente de que posso solicitar a consulta, correção ou exclusão dos meus dados a qualquer momento.`
