# 🛒 Zero Frame

**Uma loja, a mesma conta no computador e no celular.**

O Zero Frame é um projeto acadêmico de uma loja de roupas e acessórios. Este repositório reúne o site para computador, o aplicativo para Android e iPhone e a API que conecta os dois ao banco de dados.

A continuação para o quarto semestre reaproveita o site e a API em C# do terceiro semestre e integra as telas do aplicativo feitas com React Native e Expo.

## 📌 Como o projeto funciona

O site e o aplicativo são duas formas de acessar a mesma loja. A API recebe as ações do usuário e consulta ou salva as informações no SQL Server.

```text
Site no computador ──┐
                     ├── API em C# ── Banco SQL Server
Aplicativo no celular┘
```

Por exemplo: você entra na sua conta pelo computador, adiciona um produto ao carrinho e salva seu endereço. Quando entra nessa mesma conta pelo aplicativo conectado à mesma API, encontra esses dados lá também.

O projeto permite:

- Criar uma conta e fazer login.
- Consultar produtos, tamanhos, cores e estoque.
- Adicionar, alterar e remover itens do carrinho.
- Salvar endereços e produtos favoritos.
- Registrar pedidos e consultar seu histórico.
- Editar dados da conta e enviar mensagens de suporte.

**Os dados ficam no banco, mesmo depois de sair da conta ou fechar a tela.** Para enxergar as alterações feitas no outro dispositivo, reabra a tela ou atualize a página.

> Cada instalação tem seu próprio banco. Para compartilhar os dados, site e aplicativo precisam acessar a mesma API e a mesma base. Baixar o repositório não copia as contas de quem desenvolveu o projeto.

## 🛠️ O que foi utilizado

| Parte | Tecnologia | Função |
| --- | --- | --- |
| Site | HTML, CSS e JavaScript | Telas acessadas pelo navegador do computador |
| Aplicativo | React Native, Expo e TypeScript | Telas acessadas pelo Expo Go no celular |
| API | C# e ASP.NET Core 10 | Login, regras da loja e comunicação com o banco |
| Banco | SQL Server e Entity Framework Core | Armazenamento e acesso aos dados |
| Documentação da API | Swagger | Consulta e teste dos endpoints |
| Autenticação | JWT | Identificação da conta nas chamadas à API |

O site e a API vieram do [projeto do terceiro semestre](https://github.com/Gu-souzza/sistema-academico-pim-3). A interface do aplicativo veio do [projeto mobile da equipe](https://github.com/murilokkj/zeroframe-mobile-interface). Nesta integração, as telas passaram a usar a API compartilhada, com ajustes no banco, nos serviços e na navegação. [Créditos e versões de origem](docs/origem.md).

## ✅ O que precisa instalar

| Programa | Quando é necessário |
| --- | --- |
| **Windows e Visual Studio 2026** | Para abrir e iniciar a API pelo botão Play |
| **Carga de trabalho “Desenvolvimento para ASP.NET e Web” e .NET SDK 10** | Para compilar a API; selecione no Visual Studio Installer |
| **SQL Server Express LocalDB** | Para armazenar os dados localmente; instale pelo Visual Studio Installer, em Componentes individuais |
| **Node.js 24 com npm** | Para instalar e iniciar o aplicativo pelo Expo |
| **Expo Go compatível com o SDK 58** | Para abrir o aplicativo no Android ou iPhone |
| **Conta Expo** | Para entrar no Expo do computador e no Expo Go |

Para testar no celular, o PC e o aparelho devem estar conectados ao mesmo roteador. O PC pode estar no cabo e o celular no Wi-Fi. O primeiro preparo também precisa de internet para baixar os pacotes.

## 💻 1. Iniciar a API pelo Visual Studio

**Primeira vez neste computador?** Siga antes o [guia de preparação do banco e da configuração local](docs/primeiro-acesso.md). Ele usa o Visual Studio, sem PowerShell.

Se o projeto já está configurado:

1. Abra a pasta do projeto e dê dois cliques em **`API/ZeroFrame.slnx`**.
2. No Visual Studio, no **Gerenciador de Soluções**, clique com o botão direito em **ZeroFrame.API** e selecione **Definir como Projeto de Inicialização**.
3. Na lista ao lado do botão verde de executar, selecione **https**.
4. Clique no **Play** ou pressione **F5**. Se o Visual Studio pedir para confiar no certificado HTTPS de desenvolvimento, confirme no próprio Visual Studio.
5. Aguarde abrir o **Swagger** no navegador. Deixe a aplicação rodando.

O Swagger mostra as operações disponíveis na API. Para usar a loja com as telas, abra o site no próximo passo.

## 🌐 2. Abrir o site

Com a API rodando, clique aqui no README do GitHub:

[![Abrir o site Zero Frame](https://img.shields.io/badge/Abrir_o_site-Zero_Frame-8C5A3C?style=for-the-badge)](https://localhost:7291/desktop/index.html)

[Abrir o site](https://localhost:7291/desktop/index.html) · [Abrir o Swagger](https://localhost:7291/swagger) · [Verificar API e banco](https://localhost:7291/api/health)

Entre na sua conta ou abra o menu do usuário, clique em **Entre na sua conta** e depois em **Registre-se** para criar uma.

> **Esse botão abre o site no seu computador.** O endereço `localhost` funciona enquanto a API estiver rodando na sua máquina. O site não está hospedado no GitHub: o GitHub guarda os arquivos e o link para abri-lo localmente. Clicar em `index.html` na lista de arquivos mostra o código; use o botão acima para abrir a loja.

## 📱 3. Gerar o QR code e abrir no Expo Go

### Deixar a API acessível ao celular

1. No Visual Studio, pare a execução atual com **Shift + F5**.
2. Na lista ao lado do Play, selecione **https-celular** e clique no **Play** novamente. Esse perfil mantém o site no mesmo endereço e também permite acesso HTTP à API pela rede local.
3. No Windows, abra **Configurações → Rede e Internet → Ethernet ou Wi-Fi → Propriedades** e localize o **endereço IPv4** do computador. Exemplo: `192.168.0.23`.
4. Na pasta **`mobile`**, crie o arquivo **`.env.local`** e coloque a linha abaixo, trocando `IP_DO_PC` pelo IPv4 que encontrou:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_DO_PC:5140/api
```

Exemplo: `EXPO_PUBLIC_API_URL=http://192.168.0.23:5140/api`. Use o IP da sua máquina, não o do exemplo. O arquivo deve se chamar `.env.local`, sem `.txt` no final.

No navegador do celular, abra `http://IP_DO_PC:5140/api/health`. Se aparecer `status: ok` e `banco: SQL Server`, o aparelho já consegue alcançar a API. Se não abrir, confira a rede, o perfil **https-celular** e a permissão de rede privada da API no Firewall do Windows.

### Iniciar o Expo pelo CMD

1. Abra a pasta **`mobile`** no Explorador de Arquivos.
2. Clique na barra de endereço, digite **`cmd`** e pressione **Enter**. Isso abre o **Prompt de Comando** já nessa pasta.
3. Na primeira vez, instale os pacotes:

```cmd
npm ci
```

4. Entre na sua conta Expo:

```cmd
npx expo login
```

5. Inicie o aplicativo:

```cmd
npx expo start --lan --go
```

**O QR code aparece nessa janela do CMD.** Ele é gerado para a sessão atual; não há um QR code fixo do projeto no GitHub.

- **iPhone:** abra a Câmera, leia o QR code e toque em **Abrir no Expo Go**.
- **Android:** abra o Expo Go e use a opção para escanear o QR code.
- Use a mesma conta Expo no computador e no Expo Go. Dentro do Zero Frame, entre com o **mesmo e-mail e senha que usou no site**. A conta Expo e a conta da loja são contas diferentes.

Deixe **a API rodando no Visual Studio e o Expo aberto no CMD** durante o teste. Se o Windows solicitar acesso à rede, permita na rede privada usada no teste. Se mudar o IP do PC, atualize `.env.local` e reinicie o Expo. Um QR code que abre as telas não garante sozinho que a API está acessível; confira também o endereço de saúde acima.

As orientações de QR code e conexão seguem a [documentação do Expo](https://docs.expo.dev/get-started/start-developing/).

## 🔄 4. Conferir se os dados estão compartilhados

1. Entre no site e adicione um produto ao carrinho. Salve também um endereço.
2. Abra o aplicativo e entre com a mesma conta da loja.
3. Confira o carrinho e os endereços.
4. Adicione outro produto pelo celular e atualize a página do carrinho no computador.
5. Saia da conta, entre novamente e confira que as informações continuam salvas.

Esse compartilhamento já foi confirmado em teste manual de computador para iPhone neste projeto. A configuração de rede de cada integrante ainda precisa estar correta.

## 📂 Onde encontrar cada parte

| Pasta | Conteúdo |
| --- | --- |
| [`API`](API) | API C#, solução do Visual Studio e acesso ao SQL Server |
| [`FRONTEND`](FRONTEND) | Telas do site |
| [`mobile`](mobile) | Aplicativo Expo |
| [`docs`](docs) | Guias e documentação técnica |
| [`database`](database) | Script SQL das atualizações do banco |
| [`tests`](tests) | Verificações automatizadas |

## 🗃️ Atualização do banco: estoque e procedures

O complemento SQL da equipe foi adaptado à API. Ele registra automaticamente mudanças de estoque e acrescenta procedures de compra, cancelamento e consulta de categorias. A instalação é feita pelo perfil **Preparar banco** do Visual Studio, sem executar o arquivo original manualmente.

**Já usa uma base com dados?** Confira a conexão e faça backup antes de atualizar. [Veja o que mudou, como instalar e como testar](database/README.md).

O histórico pode ser consultado por administradores no Swagger. A compra do site/app continua passando pela API, inclusive para itens selecionados no carrinho.

## 📖 Documentação complementar

- [Primeira configuração pelo Visual Studio](docs/primeiro-acesso.md)
- [Rotas e configuração da API](docs/api.md)
- [Análise e ajustes do banco](docs/analise-banco.md)
- [Novo complemento SQL: histórico, trigger e procedures](database/README.md)
- [Roteiro de testes](docs/testes.md)
- [Revisão dos links e botões do site](docs/revisao-navegacao.md)

## 🚧 O que ainda está limitado

Este é um ambiente de teste local da equipe. O checkout registra pedidos pendentes e atualiza o estoque; não processa pagamentos reais. O frete usa a regra percentual existente na API, sem cotação de transportadora por CEP. A recuperação de senha por e-mail ainda não está implementada. As mensagens de suporte ficam registradas no banco para atendimento posterior.
