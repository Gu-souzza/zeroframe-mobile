import type { CredenciaisLogin, DadosRegistro, RespostaAutenticacao, Usuario } from '../types';
import { enviar, ErroApi, requisicao } from './api';
import { alterarSessao, obterToken } from './sessao';

type UsuarioApi = Omit<Usuario, 'id'> & { id?: number; usuarioId?: number };

function mapearUsuario(dados: UsuarioApi): Usuario {
  return { id: String(dados.usuarioId ?? dados.id), nome: dados.nome, email: dados.email, telefone: dados.telefone };
}

export async function obterUsuarioAtual(): Promise<Usuario | null> {
  if (!obterToken()) return null;
  try {
    return mapearUsuario(await requisicao<UsuarioApi>('/usuarios/me'));
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) return null;
    throw erro;
  }
}

async function autenticar(rota: string, dados: CredenciaisLogin | DadosRegistro): Promise<RespostaAutenticacao> {
  const resposta = await enviar<UsuarioApi & { token: string }>(rota, 'POST', dados);
  const usuario = mapearUsuario(resposta);
  await alterarSessao({ token: resposta.token, usuarioId: Number(usuario.id) });
  return { usuario, token: resposta.token };
}

export function entrar(credenciais: CredenciaisLogin) {
  return autenticar('/usuarios/login', credenciais);
}

export function registrar(dados: DadosRegistro) {
  return autenticar('/usuarios', dados);
}

export function sair() {
  return alterarSessao(null);
}

async function atualizarConta(dados: Partial<Usuario> & { senhaAtual?: string; novaSenha?: string }) {
  const usuario = await obterUsuarioAtual();
  if (!usuario) throw new Error('Entre na sua conta para continuar.');
  return mapearUsuario(await enviar<UsuarioApi>('/usuarios/meus-dados', 'PUT', { ...usuario, ...dados }));
}

export function atualizarPerfil(dados: Pick<Usuario, 'nome' | 'telefone'>) {
  return atualizarConta(dados);
}

export function alterarEmail(novoEmail: string, senhaAtual: string) {
  return atualizarConta({ email: novoEmail, senhaAtual });
}

export async function alterarSenha(senhaAtual: string, novaSenha: string) {
  await atualizarConta({ senhaAtual, novaSenha });
}

export async function excluirConta() {
  await requisicao('/usuarios/me', { method: 'DELETE' });
  await alterarSessao(null);
}
