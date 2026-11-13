import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:5140/api').replace(/\/+$/, '');
const chave = 'zeroframe.compartilhada.' + Array.from(API_URL, (c) => c.codePointAt(0)!.toString(16)).join('-');

interface Sessao { token: string; usuarioId: number }

let sessao: Sessao | null = null;
let carregamento: Promise<void> | undefined;
const ouvintes = new Set<() => void>();

function publicar(valor: Sessao | null) {
  sessao = valor;
  for (const ouvinte of ouvintes) ouvinte();
}

export function carregarSessao() {
  carregamento ??= (async () => {
    try {
      const salvo = Platform.OS === 'web'
        ? globalThis.sessionStorage?.getItem(chave)
        : await SecureStore.getItemAsync(chave);
      if (!salvo) return;
      const dados = JSON.parse(salvo) as Partial<Sessao>;
      if (typeof dados.token === 'string' && Number.isInteger(dados.usuarioId)) publicar(dados as Sessao);
    } catch {
      // O app ainda pode iniciar uma sessão em memória.
    }
  })();
  return carregamento;
}

export async function alterarSessao(valor: Sessao | null) {
  publicar(valor);
  try {
    if (Platform.OS === 'web') {
      if (valor) globalThis.sessionStorage?.setItem(chave, JSON.stringify(valor));
      else globalThis.sessionStorage?.removeItem(chave);
    } else if (valor) {
      await SecureStore.setItemAsync(chave, JSON.stringify(valor));
    } else {
      await SecureStore.deleteItemAsync(chave);
    }
  } catch {
    // A sessão ainda vale nesta execução.
  }
}

export const obterToken = () => sessao?.token ?? null;

export function usuarioIdAtual() {
  if (!sessao) throw new Error('Entre na sua conta para continuar.');
  return sessao.usuarioId;
}

export const rotaUsuario = () => '/usuarios/' + usuarioIdAtual();

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => { ouvintes.delete(ouvinte); };
}

export function useToken() {
  return useSyncExternalStore(inscrever, obterToken, () => null);
}
