/**
 * Barra de navegação inferior (Figma: "Nav-bar (Padrão)").
 *
 * Itens: início, buscar, carrinho, perfil. O item ativo ganha fundo
 * `nav/destaque` (creme), ícone na cor `secundario` e texto semibold.
 * O ícone do carrinho mostra um balão com a quantidade de itens.
 *
 * Os ícones são pintados com `tintColor` (ativo = `secundario`,
 * inativo = creme), assim um só arquivo SVG serve para os dois estados.
 *
 * Navegação: cada item abre a sua tela (início, buscar, carrinho, perfil).
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ImageSource } from 'expo-image';

import { useCarrinho } from '../context/CarrinhoContext';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { Icone } from './Icone';

export type ItemNavegacao = 'inicio' | 'buscar' | 'carrinho' | 'perfil';

/** Altura da barra sem a área segura (48 do item + 8 + 8 de padding). */
export const ALTURA_BARRA_NAVEGACAO = 64;

interface BarraNavegacaoProps {
  ativo: ItemNavegacao;
}

/** Rota de cada item da barra. */
const ROTAS = {
  inicio: '/inicio',
  buscar: '/buscar',
  carrinho: '/carrinho',
  perfil: '/perfil',
} as const;

/**
 * Abre a tela do item. `navigate` reaproveita a tela se ela já estiver na
 * pilha (em vez de empilhar cópias ao alternar entre as abas).
 */
function navegarPara(item: ItemNavegacao, ativo: ItemNavegacao) {
  if (item === ativo) return;
  router.navigate(ROTAS[item]);
}

export function BarraNavegacao({ ativo }: BarraNavegacaoProps) {
  const { cores, icones } = useTema();
  const { totalItens } = useCarrinho();
  const insets = useSafeAreaInsets();

  const itens: { id: ItemNavegacao; rotulo: string; icone: ImageSource | number }[] = [
    { id: 'inicio', rotulo: 'início', icone: icones.navInicio },
    { id: 'buscar', rotulo: 'buscar', icone: icones.navBuscar },
    { id: 'carrinho', rotulo: 'carrinho', icone: icones.navCarrinho },
    { id: 'perfil', rotulo: 'perfil', icone: icones.navPerfil },
  ];

  return (
    <View
      style={[
        estilos.barra,
        { backgroundColor: cores.secundario, paddingBottom: 8 + insets.bottom },
      ]}
    >
      {itens.map((item) => {
        const estaAtivo = item.id === ativo;
        return (
          <Pressable
            key={item.id}
            onPress={() => navegarPara(item.id, ativo)}
            accessibilityRole="tab"
            accessibilityState={{ selected: estaAtivo }}
            accessibilityLabel={
              item.id === 'carrinho' && totalItens > 0 ? `carrinho, ${totalItens} itens` : item.rotulo
            }
            style={[estilos.item, estaAtivo && { backgroundColor: cores.navDestaque }]}
          >
            <Icone
              fonte={item.icone}
              largura={24}
              altura={24}
              tintColor={estaAtivo ? cores.secundario : cores.navTexto}
            />
            <Text
              style={[
                estilos.rotulo,
                estaAtivo
                  ? { fontFamily: fontes.semiBold, color: cores.secundario }
                  : { fontFamily: fontes.regular, color: cores.navTexto },
              ]}
            >
              {item.rotulo}
            </Text>

            {/* Balão com a quantidade de itens no carrinho (Figma: "Pop item no carrinho") */}
            {item.id === 'carrinho' && totalItens > 0 && (
              <View style={estilos.balao}>
                <Text style={estilos.textoBalao}>{totalItens > 9 ? '9+' : totalItens}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 8,
    // Sombra para cima (Figma: drop-shadow 0 -1 0.5 rgba(0,0,0,0.5))
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.5,
    shadowRadius: 0.5,
    elevation: 4,
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  rotulo: {
    fontSize: 10,
    textAlign: 'center',
  },
  balao: {
    // Figma: 16x16 em (260, 5) da barra → canto superior direito do ícone.
    position: 'absolute',
    top: -3,
    right: 6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#201B1B', // Figma: `fundo-escuro`, igual nos dois temas
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBalao: {
    fontFamily: fontes.semiBold,
    fontSize: 10,
    color: '#F5EBE0',
  },
});
