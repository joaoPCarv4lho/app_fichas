# Design

## Tom

Rosé/nude sofisticado, claro, com acento dourado discreto. Interface em pt-BR, pensada para uso com o dedo em celular e tablet.

## Tokens

Cores, raios, sombras e alturas ficam em `:root` de `src/styles.css` (marca, neutros, semânticos `--danger` e `--ok`, escala `--r-*`, `--sh-*`, `--tabbar-h`). Use as variáveis, não valores soltos. O tema do PWA (`theme_color`, `background_color`) está em `vite.config.js`.

## Layout

- Coluna única (`.app`) com largura máxima de 620px, centrada.
- Navegação inferior (`TabBar`): Agenda (`/`) e Clientes (`/clientes`).
- Cabeçalho de página: `TopBar` (voltar, título, ação).
- Respeita áreas seguras do iPhone (`--sat`, `--sab`).

## Componentes

`TabBar`, `TopBar`, `Toast`, `Skeleton`, `DynamicForm` (renderiza as perguntas de `fichaSchemas.js`), `SignaturePad`, `PhotoCapture`, `InstallCard`. Páginas usam as classes comuns de `styles.css` (`.field`, `.btn`, `.empty`, `.notice`, `.error-text`).

## Estados

- Carregando: `Skeleton` e texto "Carregando…".
- Vazio: bloco `.empty` com mensagem.
- Erro: `.notice` ("Erro: ...") e `.error-text` em campos.
- Sucesso: `Toast`.
- Animações reduzidas com `prefers-reduced-motion` (`styles.css`).

## Agendamento

A hora é escolhida por dois `<select>` (Hora e Minuto) em `AgendamentoForm`, no lugar do relógio nativo do `input type=time`. A data usa `input type=date`.

## Acessibilidade e toque

Alvo de toque de 48px nos selects de hora e no campo de data, 52px de altura mínima na barra superior. Há `:focus-visible` com contorno visível e `aria-label` nos selects de hora e nos botões de ícone.

## Breakpoints

Há apenas um `@media` em `styles.css`: `prefers-reduced-motion: reduce`. Não existem breakpoints de largura; o layout é fluido até 620px.
