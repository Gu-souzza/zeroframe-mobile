# Primeira configuração pelo Visual Studio

Este guia é para quem acabou de baixar o projeto e ainda não tem a conexão e o banco configurados. A API é iniciada pelo Visual Studio; não é necessário usar PowerShell.

Se você já abre o site, faz login e encontra seus dados salvos, essa preparação já foi feita. Volte ao [passo de iniciar a API](../README.md#-1-iniciar-a-api-pelo-visual-studio).

## 1. Baixar e abrir o projeto

1. Na página do repositório, clique em **Code → Download ZIP** e extraia o arquivo para uma pasta do computador. Quem usa Git também pode clonar o repositório.
2. Evite deixar o projeto dentro de pastas sincronizadas pelo OneDrive ou Google Drive.
3. Confirme no **Visual Studio Installer** que o Visual Studio 2026 tem a carga **Desenvolvimento para ASP.NET e Web**, o **.NET SDK 10** e o componente **SQL Server Express LocalDB**.
4. Abra **`API/ZeroFrame.slnx`** e aguarde a restauração dos pacotes NuGet. Se necessário, clique com o botão direito na solução e escolha **Restaurar Pacotes NuGet**.
5. Clique com o botão direito em **ZeroFrame.API → Definir como Projeto de Inicialização**.

## 2. Criar a configuração particular do computador

A conexão e a chave que assina os logins ficam em um arquivo local, que não é enviado ao GitHub.

1. No Visual Studio, use **Arquivo → Novo → Arquivo** e escolha um arquivo de texto ou JSON.
2. Cole a configuração abaixo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ZeroFrameMobile;Integrated Security=true;TrustServerCertificate=true"
  },
  "Jwt": {
    "SecretKey": "SUBSTITUA_POR_UMA_CHAVE_ALEATORIA_PARTICULAR",
    "Issuer": "ZeroFrameAPI",
    "Audience": "ZeroFrameFrontend"
  }
}
```

3. Substitua **somente o conteúdo entre aspas** de `SecretKey` por uma sequência aleatória particular de pelo menos **64 letras e números**. Você pode usar o gerador de senhas de um gerenciador de senhas. Não use o texto de exemplo nem a senha da sua conta.
4. Salve com o nome **`appsettings.Development.local.json`** dentro de **`API/ZeroFrame.API`**, na mesma pasta de `Program.cs`. Confira que o nome não terminou em `.txt`.

O exemplo usa o LocalDB do Windows e cria um banco chamado `ZeroFrameMobile`. Se a equipe já tem um banco com contas e pedidos, a conexão precisa apontar para esse banco. Criar outro banco não importa os dados antigos. Consulte o responsável pelo banco antes de atualizar uma base existente e preserve um backup.

**Já existe esse arquivo?** Não o substitua para seguir este guia: ele pode apontar para o banco que você já usa. A chave local também deve permanecer estável para manter válidos os logins emitidos.

## 3. Preparar o banco usando o Play

1. Na lista ao lado do Play, selecione **Preparar banco**.
2. Clique no **Play**.
3. Aguarde a execução terminar. Esse perfil aplica as atualizações do banco, incluindo o histórico de estoque, a trigger e as procedures, adiciona dois produtos de demonstração **apenas se o catálogo estiver vazio** e confere a estrutura. A versão atual verifica **15 tabelas e 97 colunas**, a trigger habilitada e as três procedures.
4. Se tudo der certo, a execução encerra sem abrir o site. Isso é esperado: esse perfil prepara o banco e termina.
5. Se houver uma exceção ou erro de conexão, consulte a janela **Saída/Output** antes de continuar.

Não é preciso executar esse preparo toda vez que for usar o projeto. Execute novamente quando precisar aplicar novas atualizações do banco.

## 4. Abrir a API e o site

1. Se ainda houver uma execução ativa, encerre com **Shift + F5**.
2. Troque o perfil para **https** e clique no **Play**.
3. Se o Visual Studio solicitar confiança no certificado HTTPS de desenvolvimento, confirme no Visual Studio.
4. Aguarde o Swagger abrir e deixe a aplicação rodando.
5. Volte ao GitHub e clique no botão **Abrir o site Zero Frame** do README.

[Abrir o site](https://localhost:7291/desktop/index.html) · [Verificar API e banco](https://localhost:7291/api/health)

As contas não vêm prontas no repositório. No site, abra **Entre na sua conta → Registre-se** e faça seu cadastro. Para entrar no aplicativo, use esse mesmo e-mail e senha, com o app conectado à mesma API.

## Perfis disponíveis no Visual Studio

| Perfil | Para que serve |
| --- | --- |
| **Preparar banco** | Atualiza o banco configurado, carrega o catálogo inicial se estiver vazio e faz a conferência. Encerra ao terminar. |
| **https** | Inicia a API, o Swagger e o site para uso no próprio computador. |
| **https-celular** | Mantém o site HTTPS no computador e aceita chamadas HTTP à API pela rede local, para teste com Expo Go. |
| **http** | Alternativa HTTP local; o botão HTTPS do README usa os perfis acima. |

Use um perfil de cada vez. Para trocar, pare a aplicação antes de iniciar outra execução.

## Se algo não abrir

| Situação | O que conferir |
| --- | --- |
| “A chave JWT SecretKey não foi configurada” | Nome e pasta do arquivo local, JSON válido e chave preenchida. |
| Erro de conexão SQL Server | LocalDB instalado e conexão apontando para a instância correta. |
| Site com erro de conexão recusada | API rodando no perfil **https** ou **https-celular**; o GitHub não inicia a API. |
| Swagger abre, mas o banco não responde | Acesse o link de saúde e revise a preparação e a conexão do banco. |
| Erro de DLL em uso ao compilar | Encerre a execução anterior com **Shift + F5** e feche outras instâncias dessa API. |
| Celular abre as telas, mas não encontra a conta | Confira o endereço da API em `mobile/.env.local`, a rede local e o banco escolhido. |

Para gerar o QR code, siga a [seção do Expo Go no README](../README.md#-3-gerar-o-qr-code-e-abrir-no-expo-go).
