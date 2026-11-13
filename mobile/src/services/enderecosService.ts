import type { Endereco, EnderecoSalvo } from '../types';
import { enviar, requisicao } from './api';
import { rotaUsuario, usuarioIdAtual } from './sessao';

type EnderecoApi = Omit<Endereco, 'uf'> & { id: number; estado: string; principal?: boolean };

export async function listarEnderecos(): Promise<EnderecoSalvo[]> {
  const lista = await requisicao<EnderecoApi[]>('/usuarios/me/enderecos');
  return lista.map(({ id, estado, principal, ...dados }) => ({
    ...dados, id: String(id), uf: estado, principal: principal ?? false,
  }));
}

export async function obterEndereco(id: string) {
  return (await listarEnderecos()).find((endereco) => endereco.id === id) ?? null;
}

export async function salvarEndereco({ id, uf, principal, ...dados }: Endereco & { principal: boolean; id?: string }) {
  const rota = rotaUsuario() + '/endereco';
  const endereco = { ...dados, estado: uf, ativo: true, usuarioId: usuarioIdAtual() };
  const salvo = id
    ? (await enviar(rota + '/' + id, 'PUT', { ...endereco, id: Number(id) }), id)
    : String((await enviar<EnderecoApi>(rota, 'POST', endereco)).id);
  if (principal) await tornarPrincipal(salvo);
  return obterEndereco(salvo);
}

export async function tornarPrincipal(id: string) {
  await enviar('/usuarios/me/enderecos/' + id + '/principal', 'PUT');
}

export async function excluirEndereco(id: string) {
  await requisicao(rotaUsuario() + '/endereco/' + id, { method: 'DELETE' });
}

export async function buscarCep(cep: string): Promise<Omit<Endereco, 'numero' | 'complemento'>> {
  const digitos = cep.replace(/\D/g, '');
  if (digitos.length !== 8) throw new Error('O CEP deve ter oito dígitos.');
  const resposta = await fetch('https://viacep.com.br/ws/' + digitos + '/json/');
  if (!resposta.ok) throw new Error('Consulta de CEP indisponível. Preencha o endereço manualmente.');
  const dados = await resposta.json();
  if (dados.erro) throw new Error('CEP não encontrado.');
  return { rua: dados.logradouro, bairro: dados.bairro, cidade: dados.localidade, uf: dados.uf, cep: dados.cep };
}
