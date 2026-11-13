# Revisão da navegação do site

Revisão em 13/11/2026 dos arquivos de todas as 13 páginas HTML em `FRONTEND`.

## Problemas corrigidos

- O texto “Entre na sua conta” era um parágrafo sem destino. O menu compartilhado agora cria um link para login quando não há usuário salvo, tanto na página inicial quanto nas páginas internas. A engrenagem também leva visitantes ao login; clientes e administradores mantêm seus destinos específicos.
- Rodapés tinham links `#` para categorias e listas de produtos. Agora levam à busca correspondente.
- Links “Conheça a empresa” e “Criadores” tinham caminhos relativos incorretos em seis páginas. As referências agora apontam para a página Sobre e sua seção de fundadores.
- “Produtos em alta” em páginas sem essas seções agora aponta para a seção correspondente da página inicial.
- “Calçados” na página inicial e na busca procurava “Calça”. Agora procura “Calçado”.
- Favoritos tinha o atributo `defer` dentro do caminho do script de tema. Favoritos e Endereços também carregavam esse script duas vezes; isso podia provocar erro de rede ou redeclaração de variáveis. Cada página agora o carrega uma única vez.
- O carrossel da página inicial era JavaScript comum carregado como Babel e dependia desnecessariamente de três bibliotecas remotas. Agora usa script comum com `defer`. A página da conta carregava esse carrossel sem ter seu elemento de destino; essa inclusão foi removida.
- “Limpar filtros” não disparava nova busca. Agora também emite a alteração para atualizar os resultados e a URL.
- A lista inicial ficava em “Carregando” quando o catálogo estava vazio. Agora informa que não há produtos.
- “Editar informações” não tinha ação. Agora posiciona o foco no formulário existente.
- A troca de e-mail exigia senha atual na API, mas o formulário não oferecia esse campo. Agora oferece, valida e envia a senha apenas quando preenchida.
- O ícone da página de conta tinha um caminho inexistente. Foi corrigido.

## Funcionalidade ausente

Recuperação de senha não tem tela nem serviço implementado nesta versão. O link vazio foi substituído por uma informação explícita de indisponibilidade. Isso não implementa recuperação por e-mail.

## Validação e limites

- `python scripts/validar-navegacao.py`: 13 páginas e 443 referências locais, sem destinos/âncoras inexistentes ou scripts externos duplicados na mesma página.
- `node --test tests/navegacao.test.mjs`: quatro testes aprovados para visitantes em diferentes caminhos, cliente, administrador e limpeza da sessão ao sair.
- Verificação de sintaxe JavaScript e `git diff --check`.
- O navegador automatizado não conseguiu acessar o servidor local nesta sessão; portanto a validação visual e os fluxos completos com API/banco não foram repetidos nesta revisão.

Essa revisão cobre navegação e os problemas relacionados encontrados no código. Não comprova equivalência de todas as funcionalidades entre site e aplicativo, nem disponibilidade dos serviços externos (fontes, ícones e VLibras).

## Origem do problema do login

Na versão desktop de origem `512cfa571d6e624ee2a47d93f2ed09464bd7de8a`, o menu já usava `textContent` para colocar “Entre na sua conta” em um `<p>`, sem link. A página de login existia separadamente. A comparação não determina qual versão ou caminho a equipe utilizou nos testes anteriores.
