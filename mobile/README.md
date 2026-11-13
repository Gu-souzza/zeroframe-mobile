# Zero Frame — App Mobile

App da loja de streetwear **Zero Frame** (projeto PIM 4), feito em
**React Native + Expo (SDK 58)** com **Expo Router** e **TypeScript**.
O mesmo código roda em **Android, iOS e Web**.

É a versão mobile do site da Zero Frame
([github.com/murilokkj/zeroframe-final](https://github.com/murilokkj/zeroframe-final)).
As telas seguem o arquivo **"PIM"** do Figma (`THhGRmcwsChE1uCgZUNV0T`), nos temas
claro e escuro.

> As telas usam a API ASP.NET Core do desktop. Use a mesma conta nos dois
> clientes para acessar o catálogo, os endereços, os favoritos, o carrinho
> e os pedidos. Veja [Como conectar a API](#como-conectar-a-api).

---

## Sumário

1. [Como rodar](#como-rodar)
2. [Antes de subir código](#antes-de-subir-código)
3. [Tecnologias](#tecnologias)
4. [Estrutura de pastas](#estrutura-de-pastas)
5. [Arquitetura](#arquitetura)
6. [Telas e rotas](#telas-e-rotas)
7. [Tema claro/escuro](#tema-claroescuro)
8. [Acessibilidade: VLibras](#acessibilidade-vlibras)
9. [Regras de negócio da interface](#regras-de-negócio-da-interface)
10. [Como conectar a API](#como-conectar-a-api)
11. [Convenções do código](#convenções-do-código)
12. [Como adicionar uma tela nova](#como-adicionar-uma-tela-nova)
13. [Problemas conhecidos e soluções](#problemas-conhecidos-e-soluções)

---

## Como rodar

Pré-requisito: **Node.js LTS**.

```bash
npm install
npx expo start          # abre o menu: "a" Android, "i" iOS, "w" Web
```

- **No celular:** instale o app **Expo Go** e leia o QR code do terminal.
  Todas as bibliotecas nativas usadas estão incluídas no Expo Go
  (inclusive `react-native-webview` e `react-native-view-shot`), então não é
  preciso fazer um *development build*.
- **Só web:** `npm run web` (ou `npx expo start --web`).
- **Windows:** se o PowerShell bloquear o `npx` (erro de *execution policy*), use
  `npx.cmd` no lugar de `npx`, ou rode uma vez
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

> 💡 Mantenha o projeto **fora do Google Drive/OneDrive**. A sincronização corrompe
> a pasta `node_modules` (erro `EBADF` no `npm install`). Para compartilhar com a
> equipe, use Git/GitHub.

Para instalar bibliotecas, use **sempre** `npx expo install <pacote>`, e não
`npm install`: o Expo escolhe a versão compatível com o SDK 58.

---

## Antes de subir código

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint src
```

Os dois precisam passar sem erros. Use `npm run lint` em vez de `npx expo lint`,
que falha neste projeto por causa de um bug na checagem de versão.

---

## Tecnologias

| Biblioteca | Para quê |
|---|---|
| `expo-router` | Navegação por arquivos (`src/app/`) e rotas tipadas |
| `expo-image` | Fotos e ícones SVG (com `tintColor` para ícones de uma cor) |
| `expo-font` + `@expo-google-fonts/alexandria` / `archivo` | Fontes do Figma |
| `react-native-safe-area-context` | Respeitar entalhe e barra de gestos |
| `react-native-view-shot` | Animação de troca de tema no celular |
| `react-native-webview` | Widget do VLibras no celular |
| `react-native-web` | Versão web |

---

## Estrutura de pastas

```
src/
  app/          Telas. Cada arquivo é uma rota do Expo Router; _layout.tsx é o layout raiz
  components/   Componentes reutilizáveis (botões, campos, cards, cabeçalho, nav bar...)
    vlibras/      Widget do VLibras (.tsx = celular, .web.tsx = web)
  context/      Estado compartilhado entre telas: carrinho, favoritos e Libras
  services/     Camada de dados que se comunica com a API
  data/         Textos de "Sobre a marca"
  theme/        Cores, fontes, ícones e TemaContext (claro/escuro)
  types/        Tipos compartilhados (Produto, Pedido, Usuario, Endereco...)
  utils/        Validações, máscaras, preço, datas, avisos e atalhos de navegação
assets/
  icons/claro/          Ícones SVG do Figma, versão do tema claro
  icons/escuro/         Os mesmos ícones, versão do tema escuro (mesmos nomes)
  icons/monocromaticos/ Ícones de uma cor só, pintados com tintColor nos dois temas
  icons/comum/          Ícones iguais nos dois temas (coração, estrela, funil, VLibras...)
  images/               Logo, fundo das boas-vindas e fotos dos fundadores
  images/produtos/      Fotos de demonstração usadas pelo catálogo
```

O código fica em `src/`, e **dentro de `src/app/` só entram telas**. Componentes,
hooks e funções auxiliares vão nas outras pastas.

---

## Arquitetura

```
Tela (src/app)  ──usa──▶  Componentes (src/components)
      │
      ├──▶ Contextos (src/context, src/theme)     estado compartilhado
      │
      └──▶ Serviços (src/services) ──▶ API (requisicao() em api.ts)
```

- **As telas chamam os serviços** (`listarProdutos`, `entrar`, `criarPedido`).
  As requisições HTTP passam pelo helper de `api.ts`.
- **Provedores** (em `src/app/_layout.tsx`, de fora para dentro):

  ```
  SafeAreaProvider > TemaProvider > LibrasProvider > CarrinhoProvider > FavoritosProvider > Stack
  ```

| Contexto | Arquivo | O que guarda |
|---|---|---|
| `useTema()` | `src/theme/TemaContext.tsx` | `tema`, `cores`, `icones`, `alternarTema()` |
| `useCarrinho()` | `src/context/CarrinhoContext.tsx` | Itens, seleção, quantidades e o total do balão da nav bar |
| `useFavoritos()` | `src/context/FavoritosContext.tsx` | Ids dos produtos favoritos |
| `useLibras()` | `src/context/LibrasContext.tsx` | Se o painel do VLibras está aberto (celular) e `traduzir(texto)` |

| Serviço | Responsabilidade |
|---|---|
| `api.ts`, `sessao.ts` | URL da API, requisições HTTP e sessão |
| `authService.ts` | Login, cadastro, sessão, perfil, troca de e-mail/senha, exclusão de conta |
| `produtosService.ts` | Seções da home, produto, recomendados, categorias, busca, filtros e buscas recentes |
| `pedidosService.ts` | Listar, ver detalhe e criar pedidos; filtros de status |
| `enderecosService.ts` | CRUD de endereços, endereço principal e busca de CEP |
| `suporteService.ts` | Envio de mensagem ao suporte e horário de atendimento |

---

## Telas e rotas

Os ids são os nós do Figma "PIM" (claro / escuro).

| Rota | Arquivo | Figma |
|---|---|---|
| `/` | `src/app/index.tsx` | 463:3 (boas-vindas, só versão clara) |
| `/login` | `src/app/login.tsx` | 471:51 / 473:85 |
| `/registro` | `src/app/registro.tsx` | 473:114 / 480:198 |
| `/inicio` | `src/app/inicio.tsx` | 483:2 / 486:173 |
| `/buscar` | `src/app/buscar.tsx` | 486:736 / 505:328 |
| `/resultados?termo=` | `src/app/resultados.tsx` | 538:1489 / 549:3258 (sem resultados: 540:2043 / 540:2316) |
| — (menu de filtros) | `src/components/MenuFiltros.tsx` | 571:764 / 571:799 |
| `/produto/:id` | `src/app/produto/[id].tsx` | 534:1170 / 538:1330 |
| `/carrinho` | `src/app/carrinho.tsx` | 509:218 / 628:1008 (vazio: 509:583 / 509:1116) |
| `/perfil` | `src/app/perfil.tsx` | 549:3814 / 628:872 |
| `/pedidos` | `src/app/pedidos.tsx` | 601:2593 / 601:2949 |
| `/pedido/:id` | `src/app/pedido/[id].tsx` | 604:960 / 611:2351 |
| `/conta/editar-perfil` | `src/app/conta/editar-perfil.tsx` | 589:728 / 599:1972 |
| `/conta/seguranca` | `src/app/conta/seguranca.tsx` | 634:2402 / 634:2628 |
| `/conta/alterar-email` | `src/app/conta/alterar-email.tsx` | 634:2481 / 634:2660 |
| `/conta/alterar-senha` | `src/app/conta/alterar-senha.tsx` | 634:2489 / 634:2680 |
| `/enderecos` | `src/app/enderecos/index.tsx` | 615:2490 / 634:976 |
| `/enderecos/novo` | `src/app/enderecos/novo.tsx` | 634:1044 / 634:1121 |
| `/enderecos/:id` | `src/app/enderecos/[id].tsx` | 634:1189 / 634:1228 |
| `/favoritos` | `src/app/favoritos.tsx` | 634:1588 / 634:1706 |
| `/suporte` | `src/app/suporte.tsx` | 634:1774 / 634:2168 |
| `/sobre` | `src/app/sobre.tsx` | 634:2240 / 634:2326 |

**Fluxo principal:** boas-vindas → login **ou** criar conta → início (produtos).
O botão voltar do login/registro sempre retorna às boas-vindas. A partir do
início, a **barra de navegação** (início, buscar, carrinho, perfil) leva às
demais áreas. "Meus pedidos", "Endereços", "Favoritos", "Segurança", "Suporte"
e "Sobre a marca" são abertos pelo menu do **perfil**.

**Atalhos de navegação** (`src/utils/navegacao.ts`): use `abrirResultados(termo)`,
`abrirProduto(produto)`, `abrirPedido(pedido)` e `voltarOu(destino)`. Este último
volta à tela anterior ou, se a tela foi aberta direto pela URL, vai para
`destino`.

---

## Tema claro/escuro

- As cores ficam em `src/theme/cores.ts`, com **os mesmos nomes das variáveis do
  Figma** (`fundo`, `texto`, `secundario`, `cardFundo`...). Nunca escreva cores em
  hexadecimal nas telas; use `const { cores } = useTema()`.
- O tema inicial segue o do sistema. Ele é alternado pela lua/sol no
  login/registro e pela chave "tema escuro" no perfil.
- **Transição:** um crossfade de ~220 ms, sem piscar uma cor sólida.
  - Celular: o app tira uma "foto" da tela (`react-native-view-shot`), troca o
    tema por baixo e a foto some aos poucos.
  - Web: uma transição CSS que fica ligada só durante a troca (classe `zf-trocando-tema`).
- **Ícones:** os SVGs do Figma têm a cor gravada no arquivo, por isso existem duas
  pastas (`claro/` e `escuro/`) com os mesmos nomes de arquivo. Use
  `useTema().icones.<nome>`. Ícones de uma cor só ficam em `iconesMonocromaticos`
  (pintados com `tintColor`), e os que não mudam com o tema ficam em `iconesComuns`.
  - Para trocar um ícone: exporte de novo do Figma e substitua o arquivo
    mantendo o mesmo nome.
- **Fontes:** use `fontes.regular`, `fontes.medium`, `fontes.semiBold` e
  `fontes.bold` (Alexandria), definidas em `src/theme/tipografia.ts`.

---

## Acessibilidade: VLibras

O VLibras (tradutor de Português para Libras do governo federal) está em
**todas as telas**, como no site.

| Plataforma | Como funciona |
|---|---|
| Web | Carrega o widget oficial de `vlibras.gov.br` (`WidgetVLibras.web.tsx`). O botão azul fica na lateral; com o widget aberto, clicar num texto traduz esse texto. |
| Android/iOS | O widget oficial só funciona em páginas web, então roda dentro de uma **WebView** (`WidgetVLibras.tsx`). O app desenha o botão azul flutuante e, com o painel aberto, **tocar em qualquer texto** envia esse texto para o avatar (`window.plugin.translate`). |

> ⚠️ **Regra importante:** importe o `Text` de **`src/components/Texto.tsx`**,
> e não do `react-native`:
>
> ```ts
> import { Text } from '../components/Texto';
> ```
>
> Esse `Text` funciona igual ao original, mas no celular fica "tocável para
> traduzir" quando o VLibras está aberto. Um texto importado do `react-native`
> não será traduzido no celular.

O VLibras precisa de internet e não depende da API da Zero Frame. No celular, o
avatar é baixado no primeiro toque no botão; a primeira abertura leva alguns
segundos.

---

## Regras de negócio da interface

**Validação de formulários** (`src/utils/validacoes.ts`). A API deve repetir as
mesmas regras no servidor.

| Campo | Regra |
|---|---|
| E-mail | Obrigatório, formato `nome@dominio.com` |
| Senha | Obrigatória, **mínimo de 6 caracteres** |
| Confirmar senha | Igual à senha |
| Nome | Nome e sobrenome, apenas letras |
| Telefone | Com DDD; 10 dígitos (fixo) ou 11 (celular começando com 9); máscara `(11) 98765-4321` |
| CEP / endereço | CEP com 8 dígitos; rua, número, bairro, cidade e UF obrigatórios; UF válida |

**Comportamentos combinados com a equipe:**

- **Finalizar compra:** registra um pedido pendente com os itens marcados no
  carrinho e abre "Meus pedidos". O código está em `criarPedido`, em
  `src/services/pedidosService.ts`.
- **Busca:** o campo de busca, as buscas recentes, os cards de categoria e o
  "VER TUDO" das seções Zero Frame/Multimarcas abrem `/resultados` com o termo.
  A seção de produtos recomendados não tem "VER TUDO".
- **Filtros:** o funil abre o menu de filtros. Cada grupo abre deslizando para
  cima e fecha deslizando para baixo. O seletor de gênero aparece só nos
  resultados da busca, não na tela de categorias.
- **Meus pedidos:** os filtros de status ficam num carrossel horizontal.
- **Fotos de produto:** sempre em quadrado 1:1 com `contentFit="cover"`
  (recortam, nunca distorcem).
- **Editar perfil:** o e-mail aparece só para leitura. Para trocá-lo, o usuário
  vai em "Alterar e-mail" (que pede a senha), por segurança.
- **Avisos:** use `avisar()` e `confirmar()` de `src/utils/avisos.ts`, e não
  `Alert.alert`, porque o `Alert` não faz nada na web.
- **Sobre a marca:** os textos, Missão, Valores e os 7 fundadores (foto, função,
  bio, GitHub/LinkedIn) ficam em `src/data/sobreMarca.ts`.
  - Os dados dos fundadores vieram da página "Sobre" do site.
  - Pedro Silva e Vinicius ainda não têm GitHub cadastrado.

---

## Como conectar a API

O [repositório do desktop](https://github.com/Gu-souzza/sistema-academico-pim-3) contém o servidor ASP.NET Core e as migrations do SQL Server. O app usa `http://127.0.0.1:5140/api` por padrão. Use a mesma instância da API que o desktop usa para recuperar contas e dados existentes.

**No navegador do computador**, inicie a API ASP.NET, rode `npx expo start --web --port 8081` na pasta do app e abra `http://localhost:8081`. Se o navegador acessar o app por outro endereço, configure essa origem em `Cors:AllowedOrigins` na API.

**No celular**, conecte o aparelho e o computador à mesma rede. No terminal da API, defina `$env:ASPNETCORE_ENVIRONMENT = 'Development'` e execute `dotnet run --no-launch-profile --urls http://0.0.0.0:5140` com a conexão SQL Server configurada. Na pasta do app, configure `EXPO_PUBLIC_API_URL=http://IP_DO_PC:5140/api` em `.env.local`. Inicie o Expo em LAN e escaneie o QR code. Para uma API publicada, use a URL HTTPS seguida de `/api`.

Ao entrar, o app guarda o token no SecureStore no celular e na sessão do navegador na web. Use a mesma conta do site. O checkout exige um endereço e cria um pedido pendente usando o estoque e o frete da API compartilhada.

---

## Convenções do código

- **Português** nos nomes (`CardProduto`, `listarPedidos`, `aoPressionar`) e nos
  comentários. Os componentes começam com um comentário explicando o que fazem e,
  quando vêm do Figma, citam o id do nó.
- **Cores, ícones e fontes** sempre vêm do tema (`useTema()`, `fontes`), nunca
  são escritos direto no código.
- **Imagens e ícones:** use `expo-image` (`<Image>`) ou o componente `<Icone>`.
- **Estilos:** `StyleSheet.create` no fim do arquivo, em um objeto chamado `estilos`.
- **Lint do React Compiler** (já ativo no ESLint):
  - não chame `setState` dentro de `useEffect` para "sincronizar" estado; use
    `key` para remontar o componente ou calcule o valor durante o render;
  - para `Animated.Value`, use `useState(() => new Animated.Value(0))`, não
    `useRef(...).current`;
  - não altere props nem argumentos de hooks (para registrar callbacks, passe
    uma função, como em `registrarTradutor` no LibrasContext).
- **Web:** não coloque um botão (`Pressable`) dentro de outro, porque o HTML não
  permite. Deixe os dois como irmãos, como o coração em `CardProduto`.
- **Pastas `ios/` e `android/`:** não existem e não devem ser criadas à mão. O
  Expo as gera; configurações nativas vão no `app.json`.

---

## Como adicionar uma tela nova

1. Crie o arquivo em `src/app/` (ex.: `src/app/cupons.tsx` vira a rota `/cupons`).
2. Use a estrutura das outras telas:
   - `CabecalhoPagina` no topo;
   - conteúdo num `ScrollView` com `paddingBottom` de
     `ALTURA_BARRA_NAVEGACAO + insets.bottom`;
   - `<BarraNavegacao ativo="..." />` no fim.
3. Pegue cores e ícones com `useTema()` e importe `Text` de `components/Texto`.
4. Se a tela precisar de dados, crie a função no serviço correspondente.
5. Inclua a rota na tabela deste README e no comentário de `src/app/_layout.tsx`.
6. Rode `npm run typecheck` e `npm run lint`.

---

## Problemas conhecidos e soluções

| Sintoma | Causa / solução |
|---|---|
| `npm install` falha com `EBADF` | Projeto dentro do Google Drive/OneDrive. Mova para uma pasta local (ex.: `C:\Projetos`). |
| `npx` bloqueado no PowerShell | Use `npx.cmd` ou `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |
| `typecheck` acusa uma rota que existe (ex.: `'/enderecos'` não é atribuível) | As rotas tipadas (`.expo/types/router.d.ts`) estão desatualizadas. Rode `npx expo start` uma vez para gerá-las de novo. |
| `npx expo lint` falha | Bug na checagem de versão; use `npm run lint`. |
| Alerta não aparece na web | Use `avisar()`/`confirmar()` em vez de `Alert.alert`. |
| Biblioteca nativa não funciona no Expo Go | Só os módulos incluídos no Expo Go funcionam lá. Fora deles, é preciso um *development build* (`eas build --profile development`). |
