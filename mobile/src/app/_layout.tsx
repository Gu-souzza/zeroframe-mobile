/**
 * Layout raiz do app (Expo Router).
 *
 * Responsável por:
 * 1. Carregar a fonte Alexandria antes de mostrar qualquer tela;
 * 2. Prover o tema claro/escuro para todo o app (TemaProvider) e o VLibras
 *    (LibrasProvider, ver src/context/LibrasContext.tsx);
 * 3. Declarar a pilha de telas (Stack), todas sem o cabeçalho padrão,
 *    porque cada tela desenha o seu próprio topo conforme o Figma.
 *
 * Mapa de rotas (cada arquivo em src/app/ é uma tela):
 *   /          → index.tsx     (boas-vindas: "Bem vindo(a) a Zero Frame!")
 *   /login     → login.tsx
 *   /registro  → registro.tsx
 *   /inicio    → inicio.tsx    (tela inicial dos produtos)
 *   /buscar    → buscar.tsx    (pesquisa: buscas recentes + categorias)
 *   /resultados?termo=...      → resultados.tsx (resultados + menu de filtros)
 *   /produto/:id → produto/[id].tsx (detalhes do produto)
 *   /carrinho  → carrinho.tsx  (itens, resumo e "finalizar compra")
 *   /perfil    → perfil.tsx    (conta, tema escuro, sair)
 *   /pedidos   → pedidos.tsx   ("Meus pedidos")
 *   /pedido/:id → pedido/[id].tsx (detalhes do pedido)
 *   /conta/editar-perfil, /conta/seguranca, /conta/alterar-email, /conta/alterar-senha
 *   /enderecos, /enderecos/novo, /enderecos/:id, /favoritos, /suporte, /sobre
 */
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Alexandria_300Light,
  Alexandria_400Regular,
  Alexandria_500Medium,
  Alexandria_600SemiBold,
  Alexandria_700Bold,
} from '@expo-google-fonts/alexandria';
import { Archivo_400Regular } from '@expo-google-fonts/archivo';

import { CarrinhoProvider } from '../context/CarrinhoContext';
import { FavoritosProvider } from '../context/FavoritosContext';
import { LibrasProvider } from '../context/LibrasContext';
import { carregarSessao, useToken } from '../services/sessao';
import { TemaProvider, useTema } from '../theme/TemaContext';

export default function LayoutRaiz() {
  const [sessaoCarregada, setSessaoCarregada] = useState(false);
  const token = useToken();
  useEffect(() => {
    carregarSessao().then(() => setSessaoCarregada(true));
  }, []);
  const [fontesCarregadas] = useFonts({
    Alexandria_300Light,
    Alexandria_400Regular,
    Alexandria_500Medium,
    Alexandria_600SemiBold,
    Alexandria_700Bold,
    Archivo_400Regular,
  });

  // Enquanto a fonte carrega, o Expo mantém a splash nativa na tela.
  if (!fontesCarregadas || !sessaoCarregada) return null;

  return (
    <SafeAreaProvider>
      <TemaProvider>
        {/* VLibras em todas as telas (botão flutuante + tradução para Libras). */}
        <LibrasProvider>
          <CarrinhoProvider key={token ?? 'visitante'}>
            <FavoritosProvider>
              <PilhaDeTelas />
            </FavoritosProvider>
          </CarrinhoProvider>
        </LibrasProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}

function PilhaDeTelas() {
  const { cores } = useTema();
  const autenticado = Boolean(useToken());

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: cores.fundo },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={!autenticado}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="inicio" />
        <Stack.Screen name="buscar" />
        <Stack.Screen name="resultados" />
        <Stack.Screen name="produto/[id]" />
        <Stack.Screen name="carrinho" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="pedidos" />
        <Stack.Screen name="pedido/[id]" />
        <Stack.Screen name="conta/editar-perfil" />
        <Stack.Screen name="conta/seguranca" />
        <Stack.Screen name="conta/alterar-email" />
        <Stack.Screen name="conta/alterar-senha" />
        <Stack.Screen name="enderecos/index" />
        <Stack.Screen name="enderecos/novo" />
        <Stack.Screen name="enderecos/[id]" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="suporte" />
        <Stack.Screen name="sobre" />
      </Stack.Protected>
    </Stack>
  );
}
