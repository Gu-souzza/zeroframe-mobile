# 🛒 Zero Frame Mobile

Aplicativo do quarto semestre integrado à API ASP.NET Core e ao banco SQL Server do Zero Frame. O site e o app usam as mesmas contas, produtos, variações, endereços, favoritos, carrinhos e pedidos.

## 📌 O que foi reunido

| Pasta | Conteúdo |
| --- | --- |
| `mobile/` | App React Native com Expo, TypeScript e telas conectadas à API |
| `API/` | Backend C# com ASP.NET Core 10, Entity Framework Core e Swagger |
| `FRONTEND/` | Site desktop para testar os mesmos dados |
| `scripts/` | Configuração local da conexão e da chave JWT |
| `tests/` | Teste HTTP de compartilhamento e autorização |
| `docs/` | Análise do banco, contrato da API e roteiro de testes |

A base veio do [projeto do terceiro semestre](https://github.com/Gu-souzza/sistema-academico-pim-3) e da [interface mobile](https://github.com/murilokkj/zeroframe-mobile-interface). Os créditos e as versões de origem estão em [docs/origem.md](docs/origem.md).

## 🛠️ Programas necessários

- Windows com PowerShell.
- Git para baixar o projeto.
- .NET SDK 10 para compilar e executar a API.
- SQL Server Express LocalDB, instalado pelo Visual Studio Installer ou pelo instalador do SQL Server Express.
- Node.js 24 com npm para executar o Expo.
- Expo Go atualizado no celular para testar o aplicativo.
- Visual Studio 2026 ou VS Code, opcional, para editar o código.

## ⚙️ Preparar a API e o banco

Clone o repositório e execute na raiz:

```powershell
git clone https://github.com/Gu-souzza/zeroframe-mobile.git
cd zeroframe-mobile
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-Local.ps1
dotnet tool restore
dotnet restore API/ZeroFrame.slnx
dotnet run --project API/ZeroFrame.API --no-launch-profile -- --atualizar-banco --catalogo-demo --verificar-banco
```

O comando cria o banco `ZeroFrameMobile`, aplica as migrations, carrega dois produtos de demonstração se o catálogo estiver vazio e compara as tabelas e colunas com o modelo da API. Cada pessoa cria a própria conta nas telas. A chave JWT é gerada no arquivo local ignorado pelo Git.

Para usar uma instalação SQL Server diferente, passe a conexão ao configurar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Configurar-Local.ps1 -Conexao 'Server=SERVIDOR;Database=ZeroFrame;Integrated Security=true;TrustServerCertificate=true'
```

Se o arquivo local já existir, edite `API/ZeroFrame.API/appsettings.Development.local.json`. Para reaproveitar contas e pedidos existentes, configure o banco que já contém esses dados e faça um backup antes de aplicar as migrations. As contas só são compartilhadas quando os dois clientes usam a mesma API e a mesma base.

Inicie a API e deixe o terminal aberto:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project API/ZeroFrame.API --no-launch-profile --urls http://0.0.0.0:5140
```

- [Swagger local](http://localhost:5140/swagger)
- [Saúde da API e conexão do banco](http://localhost:5140/api/health)
- [Site desktop](http://localhost:5140/desktop/index.html)

O perfil local usa o ambiente Development para abrir o Swagger e permitir HTTP na rede de testes. A chave e a conexão podem ser sobrescritas por variáveis de ambiente. Consulte [a configuração e o contrato](docs/api.md).

## 📱 Rodar as telas do aplicativo

Em outro terminal, a partir da raiz:

```powershell
cd mobile
npm.cmd ci
npm.cmd run web
```

O endereço da API padrão é `http://127.0.0.1:5140/api`. Abra o endereço do Expo exibido no terminal. Cadastre uma conta, escolha um produto e sua variação, salve um endereço e finalize um pedido pendente.

### Testar no Android ou iPhone

Conecte o celular à rede do mesmo roteador do computador e localize o IPv4 do PC com `ipconfig`. Crie `mobile/.env.local` com:

```dotenv
EXPO_PUBLIC_API_URL=http://IP_DO_PC:5140/api
```

Na pasta `mobile`, execute:

```powershell
npx.cmd expo start --lan
```

Abra o QR code com o Expo Go. No iPhone, use a Câmera para escanear e entre na mesma conta Expo no celular e no terminal do PC com `npx.cmd expo login`. Se o Windows solicitar acesso à rede privada para o servidor, configure essa permissão no seu computador.

O PC precisa continuar ligado e com a API e o Expo rodando. O endereço IP deve ser atualizado no arquivo local se a rede trocar o IP do computador.

## 🔄 Conferir site e celular juntos

1. Crie uma conta no site e adicione um produto ao carrinho.
2. Entre no app com o mesmo e-mail e senha.
3. Abra o carrinho do app e confira o produto existente.
4. Adicione outra variação no app e atualize a página do carrinho no site.
5. Consulte **Meus pedidos** nos dois clientes.

O carrinho do app recarrega ao abrir a tela e ao voltar ao primeiro plano. Para verificar mudanças enquanto a página do site permanece aberta, atualize a página. Os favoritos antigos de um navegador podem ser importados pela página de favoritos para a conta que estiver aberta.

## 🧪 Verificações

Com a API iniciada e um banco exclusivo de testes preparado com o catálogo de demonstração:

```powershell
node --test tests/integracao.test.mjs
dotnet run --project API/ZeroFrame.API --no-launch-profile -- --verificar-banco
cd mobile
npm.cmd run typecheck
npm.cmd run lint
```

O teste HTTP cria contas fictícias e pedidos, consome estoque e desativa a conta principal ao terminar. Use um banco de teste. A variável `ZEROFRAME_TEST_API` permite escolher outra URL para esse teste.

A análise das tabelas, das migrations e dos pontos ajustados está em [docs/analise-banco.md](docs/analise-banco.md). O [roteiro manual](docs/testes.md) orienta a demonstração pela interface.

O script [database/atualizar.sql](database/atualizar.sql) contém a sequência idempotente das migrations para revisão ou execução pelo responsável do banco.

## 🚧 Escopo atual

O checkout registra pedidos pendentes e atualiza o estoque no SQL Server. O frete segue a regra percentual existente na API desktop. A cotação de transportadoras por CEP e a recuperação de senha por e-mail ainda precisam de implementação. As mensagens de suporte ficam registradas no banco para atendimento posterior.

Este repositório reúne o código para teste local da equipe. Os dados particulares de bancos usados pelos integrantes precisam ser localizados e migrados caso devam aparecer em uma única instalação.
