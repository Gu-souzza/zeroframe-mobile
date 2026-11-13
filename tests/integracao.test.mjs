import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const base = (process.env.ZEROFRAME_TEST_API ?? 'http://127.0.0.1:5140/api').replace(/\/$/, '');

async function chamar(rota, status, { method = 'GET', token, body } = {}) {
  const resposta = await fetch(base + rota, {
    method,
    headers: {
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;
  assert.equal(resposta.status, status, method + ' ' + rota + ' ' + texto);
  return dados;
}

test('conta, carrinho, pedidos, endereços e favoritos compartilham a API e o SQL Server', async () => {
  assert.equal((await chamar('/health', 200)).status, 'ok');
  const produtos = await chamar('/produtos?pageSize=50', 200);
  const produto = produtos.items.find((item) => item.variacoes.filter((v) => v.estoque >= 3).length >= 2);
  assert(produto, 'Prepare o catálogo de demonstração em um banco de teste.');
  const [primeira, segunda] = produto.variacoes.filter((item) => item.estoque >= 3);
  const cadastro = {
    nome: 'Cliente Teste', email: randomUUID() + '@example.com',
    telefone: '11987654321', senha: 'Teste12345',
  };
  const cliente = await chamar('/usuarios', 201, { method: 'POST', body: cadastro });
  const desktop = cliente.token;
  const mobile = (await chamar('/usuarios/login', 200, { method: 'POST', body: cadastro })).token;
  const rota = '/usuarios/' + cliente.usuarioId;
  const outra = await chamar('/usuarios', 201, { method: 'POST', body: { ...cadastro, email: randomUUID() + '@example.com' } });
  const carrinhos = await Promise.all([
    chamar(rota + '/carrinho', 200, { token: desktop }),
    chamar(rota + '/carrinho', 200, { token: mobile }),
  ]);
  assert.equal(carrinhos[0].id, carrinhos[1].id, 'Dois dispositivos devem receber o mesmo carrinho ativo.');

  const endereco = await chamar(rota + '/endereco', 201, {
    method: 'POST', token: desktop, body: {
      usuarioId: cliente.usuarioId, rua: 'Rua Teste', numero: '10', bairro: 'Centro',
      cidade: 'São Paulo', estado: 'SP', cep: '01001000',
    },
  });
  const doApp = await chamar('/usuarios/me/enderecos', 200, { token: mobile });
  assert.equal(doApp[0].id, endereco.id);
  await chamar(rota + '/carrinho/itens', 201, {
    method: 'POST', token: desktop, body: { variacaoProdutoId: primeira.id, quantidade: 1 },
  });
  const itensMobile = await chamar(rota + '/carrinho/itens', 200, { token: mobile });
  assert.equal(itensMobile[0].variacaoProdutoId, primeira.id);
  await chamar(rota + '/carrinho/itens', 201, {
    method: 'POST', token: mobile, body: { variacaoProdutoId: segunda.id, quantidade: 1 },
  });
  assert.equal((await chamar(rota + '/carrinho/itens', 200, { token: desktop })).length, 2);
  await Promise.all([desktop, mobile].map((token) => chamar(rota + '/carrinho/itens', 201, {
    method: 'POST', token, body: { variacaoProdutoId: segunda.id, quantidade: 1 },
  })));
  const concorrentes = await chamar(rota + '/carrinho/itens', 200, { token: desktop });
  assert.equal(concorrentes.find((item) => item.variacaoProdutoId === segunda.id).quantidade, 3);
  await chamar(rota + '/carrinho/itens', 403, { token: outra.token });
  await chamar('/usuarios/me/favoritos/' + produto.id, 204, { method: 'PUT', token: desktop });
  await chamar('/usuarios/me/favoritos/' + produto.id, 204, { method: 'PUT', token: mobile });
  assert.deepEqual(await chamar('/usuarios/me/favoritos', 200, { token: mobile }), [produto.id]);
  assert.deepEqual(await chamar('/usuarios/me/favoritos', 200, { token: outra.token }), []);
  const compra = { enderecoId: endereco.id, itensSelecionados: [{ id: itensMobile[0].id, quantidade: 1 }] };
  const pedido = await chamar(rota + '/pedidos', 201, { method: 'POST', token: mobile, body: compra });
  await chamar(rota + '/pedidos', 400, { method: 'POST', token: mobile, body: compra });
  assert.equal((await chamar(rota + '/pedidos', 200, { token: desktop })).items[0].id, pedido.id);
  assert.equal((await chamar(rota + '/carrinho/itens', 200, { token: desktop })).length, 1);
  await chamar('/pedidos/' + pedido.id, 403, { token: outra.token });
  const atualizado = { nome: cadastro.nome, email: 'novo-' + cadastro.email, telefone: cadastro.telefone };
  await chamar('/usuarios/meus-dados', 400, { method: 'PUT', token: mobile, body: atualizado });
  await chamar('/usuarios/meus-dados', 200, { method: 'PUT', token: mobile, body: { ...atualizado, senhaAtual: cadastro.senha } });
  assert.equal((await chamar('/usuarios/me', 200, { token: desktop })).email, atualizado.email);
  await chamar('/usuarios/me/buscas-recentes', 200, { method: 'POST', token: mobile, body: { termo: 'camisa' } });
  assert.deepEqual(await chamar('/usuarios/me/buscas-recentes', 200, { token: desktop }), ['camisa']);
  const suporte = await chamar('/suporte', 200, {
    method: 'POST', token: mobile, body: { nome: cadastro.nome, email: atualizado.email,
      categoria: 'conta', assunto: 'Teste integrado', mensagem: 'Mensagem fictícia para validação.' },
  });
  assert.match(suporte.protocolo, /^[\da-f-]{36}$/);
  await chamar(rota + '/endereco/' + endereco.id, 204, { method: 'DELETE', token: mobile });
  assert.equal((await chamar('/pedidos/' + pedido.id, 200, { token: desktop })).endereco.rua, 'Rua Teste');
  await chamar('/usuarios/me', 204, { method: 'DELETE', token: mobile });
  await chamar('/usuarios/me', 401, { token: desktop });
});
