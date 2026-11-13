import { enviar, requisicao } from './api';

const rota = '/usuarios/me/favoritos';

export async function listarFavoritos() {
  return (await requisicao<number[]>(rota)).map(String);
}

export async function favoritar(produtoId: string) {
  await enviar(rota + '/' + produtoId, 'PUT');
  return listarFavoritos();
}

export async function desfavoritar(produtoId: string) {
  await requisicao(rota + '/' + produtoId, { method: 'DELETE' });
  return listarFavoritos();
}
