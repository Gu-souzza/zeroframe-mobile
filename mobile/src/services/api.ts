import { alterarSessao, API_URL, obterToken } from './sessao';

export class ErroApi extends Error {
  constructor(public readonly status: number, mensagem: string) {
    super(mensagem);
  }
}

export async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const headers = new Headers(opcoes.headers);
  if (opcoes.body !== undefined) headers.set('Content-Type', 'application/json');
  const token = obterToken();
  if (token) headers.set('Authorization', 'Bearer ' + token);

  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, { ...opcoes, headers });
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o servidor está rodando.');
  }

  const conteudo = await resposta.text();
  let corpo;
  try { corpo = JSON.parse(conteudo); } catch { corpo = conteudo; }
  if (!resposta.ok) {
    if (resposta.status === 401 && caminho !== '/usuarios/login' && token && obterToken() === token) {
      await alterarSessao(null);
    }
    const validacao = corpo?.errors ? Object.values(corpo.errors).flat().find((valor) => typeof valor === 'string') : null;
    const mensagem = typeof corpo === 'string' ? corpo : validacao ?? corpo?.mensagem ?? corpo?.message;
    throw new ErroApi(resposta.status, mensagem || 'A API respondeu com erro ' + resposta.status + '.');
  }
  return corpo as T;
}

export function enviar<T>(caminho: string, method: 'POST' | 'PATCH' | 'PUT', dados?: object, headers?: HeadersInit) {
  return requisicao<T>(caminho, { method, body: JSON.stringify(dados), headers });
}

export async function obterOuNulo<T>(caminho: string): Promise<T | null> {
  try {
    return await requisicao<T>(caminho);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}
