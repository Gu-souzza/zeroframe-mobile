# Roteiro de teste da equipe

Use um banco de demonstração e prepare a instalação conforme o README.

1. Abra o site em `http://localhost:5140/desktop/index.html` e o app pelo Expo Web ou Expo Go.
2. Cadastre uma conta no site. Entre no app com o mesmo e-mail e senha.
3. Adicione um endereço no perfil. Confira no outro cliente.
4. Escolha no site um produto e uma variação com estoque. Adicione ao carrinho.
5. Abra o carrinho no app. Confira nome, tamanho, cor, preço e quantidade.
6. Adicione outra variação pelo app e atualize o carrinho no site.
7. Marque um favorito no site. Abra Favoritos no app e confira o produto.
8. Finalize uma compra com endereço e veja o pedido pendente em ambos.
9. Remova o endereço usado na compra e confira se o pedido continua consultável.
10. Feche/reabra o app e entre novamente. Confira os dados persistidos.

Em aparelhos diferentes, todos devem apontar para o mesmo IP da API. Copiar o banco para cada máquina produz instalações independentes.

Para a verificação automática de rotas, use `node --test tests/integracao.test.mjs`. Ela usa duas sessões da mesma conta como clientes desktop e mobile, além de outra conta para testar isolamento.
