/**
 * Menu de filtros da tela de resultados (Figma: "Menu de filtros",
 * claro 571:764 / escuro 571:799).
 *
 * Abre por baixo da tela (bottom sheet) quando o usuário toca no botão de
 * funil. Cada grupo (Preço, Gênero, Categoria, Tamanho, Cor, Marca) expande
 * ao tocar e mostra as opções como pílulas; dá para marcar várias.
 *
 * - "aplicar": devolve os filtros escolhidos para a tela e fecha;
 * - "limpar filtros": desmarca tudo (só vale depois de "aplicar");
 * - "X" ou tocar fora: fecha sem aplicar as mudanças.
 */
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FILTROS_VAZIOS, type OpcaoFiltro, type OpcoesFiltros } from '../services/produtosService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { FiltrosBusca } from '../types';
import { Icone } from './Icone';
import { PilulaOpcao } from './PilulaOpcao';

/** Grupos do menu, na ordem do Figma. */
const GRUPOS: { chave: keyof FiltrosBusca; titulo: string }[] = [
  { chave: 'faixasPreco', titulo: 'Preço' },
  { chave: 'generos', titulo: 'Gênero' },
  { chave: 'categorias', titulo: 'Categoria' },
  { chave: 'tamanhos', titulo: 'Tamanho' },
  { chave: 'cores', titulo: 'Cor' },
  { chave: 'marcas', titulo: 'Marca' },
];

/** Duração da animação de abrir/fechar cada grupo, em ms. */
const DURACAO_ANIMACAO = 260;
/** Quanto as opções "sobem" (px) ao aparecer e "descem" ao sumir. */
const DESLOCAMENTO_OPCOES = 12;

interface GrupoFiltroProps {
  titulo: string;
  aberto: boolean;
  aoAlternar: () => void;
  opcoes: OpcaoFiltro[];
  selecionados: string[];
  aoAlternarOpcao: (valor: string) => void;
}

/**
 * Um grupo do menu (ex.: "Preço") com abertura animada.
 *
 * Ao abrir: a área cresce até a altura das opções, e as opções deslizam
 * para cima enquanto aparecem (opacidade 0 → 1). Ao fechar, o inverso:
 * deslizam para baixo, somem e a área encolhe. A seta gira 180°.
 *
 * Usa o `Animated` do próprio React Native (sem bibliotecas extras), que
 * funciona igual em Android, iOS e Web.
 */
function GrupoFiltro({ titulo, aberto, aoAlternar, opcoes, selecionados, aoAlternarOpcao }: GrupoFiltroProps) {
  const { cores } = useTema();

  // 0 = fechado, 1 = aberto. Um único valor controla altura, deslize, opacidade e seta.
  // (useState com inicialização preguiçosa: cria o Animated.Value uma única vez.)
  const [progresso] = useState(() => new Animated.Value(aberto ? 1 : 0));
  // Altura natural das opções, medida fora do fluxo (ver `onLayout` abaixo).
  const [alturaOpcoes, setAlturaOpcoes] = useState(0);

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: aberto ? 1 : 0,
      duration: DURACAO_ANIMACAO,
      easing: aberto ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      // `height` não pode ser animada pelo driver nativo.
      useNativeDriver: false,
    }).start();
  }, [aberto, progresso]);

  const altura = progresso.interpolate({ inputRange: [0, 1], outputRange: [0, alturaOpcoes] });
  const deslize = progresso.interpolate({ inputRange: [0, 1], outputRange: [DESLOCAMENTO_OPCOES, 0] });
  const rotacaoSeta = progresso.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View>
      <View style={[estilos.linha, { backgroundColor: cores.borda }]} />

      <Pressable
        onPress={aoAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        style={estilos.grupo}
      >
        <Text style={[estilos.textoGrupo, { color: cores.texto }]}>
          {titulo}
          {selecionados.length > 0 && ` (${selecionados.length})`}
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotacaoSeta }] }}>
          <Icone fonte={iconesMonocromaticos.chevronBaixo} largura={12.9} altura={7.5} tintColor={cores.texto} />
        </Animated.View>
      </Pressable>

      {/* Área que cresce/encolhe. As opções ficam sempre montadas para poderem animar ao fechar. */}
      <Animated.View
        style={[estilos.areaOpcoes, { height: altura }]}
        pointerEvents={aberto ? 'auto' : 'none'}
        // Esconde as opções do leitor de tela enquanto o grupo está fechado.
        accessibilityElementsHidden={!aberto}
        importantForAccessibility={aberto ? 'auto' : 'no-hide-descendants'}
      >
        <Animated.View
          // Posição absoluta: mede a altura natural das opções mesmo com a área em 0.
          style={[estilos.opcoes, { opacity: progresso, transform: [{ translateY: deslize }] }]}
          onLayout={(e) => setAlturaOpcoes(e.nativeEvent.layout.height)}
        >
          {opcoes.map((opcao) => (
            <PilulaOpcao
              key={opcao.valor}
              rotulo={opcao.rotulo}
              selecionada={selecionados.includes(opcao.valor)}
              aoPressionar={() => aoAlternarOpcao(opcao.valor)}
            />
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

interface MenuFiltrosProps {
  visivel: boolean;
  opcoes: OpcoesFiltros | null;
  /** Filtros atualmente aplicados na busca (ponto de partida do menu). */
  filtrosAplicados: FiltrosBusca;
  aoAplicar: (filtros: FiltrosBusca) => void;
  aoFechar: () => void;
}

export function MenuFiltros({ visivel, opcoes, filtrosAplicados, aoAplicar, aoFechar }: MenuFiltrosProps) {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();

  // Rascunho: as mudanças só valem para a busca ao tocar em "aplicar".
  // A tela que usa o menu o remonta a cada ABERTURA (prop `key` = nº de aberturas), então o
  // rascunho sempre recomeça a partir dos filtros aplicados.
  const [rascunho, setRascunho] = useState<FiltrosBusca>(filtrosAplicados);
  const [grupoAberto, setGrupoAberto] = useState<keyof FiltrosBusca | null>(null);

  function alternarOpcao(chave: keyof FiltrosBusca, valor: string) {
    setRascunho((atual) => {
      const lista = atual[chave] as string[];
      const nova = lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
      return { ...atual, [chave]: nova };
    });
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      {/* Área escura acima do menu: tocar fecha sem aplicar */}
      <Pressable
        style={[estilos.sobreposicao, { backgroundColor: cores.sobreposicao }]}
        onPress={aoFechar}
        accessibilityLabel="Fechar filtros"
      />

      <View
        style={[
          estilos.menu,
          { backgroundColor: cores.fundo, borderColor: cores.borda, paddingBottom: 16 + insets.bottom },
        ]}
      >
        {/* Título + fechar */}
        <View style={estilos.titulo}>
          <Text style={[estilos.textoTitulo, { color: cores.texto }]} accessibilityRole="header">
            Filtros
          </Text>
          <Pressable onPress={aoFechar} accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={10}>
            <Icone fonte={iconesMonocromaticos.fechar} largura={20} altura={20} tintColor={cores.texto} />
          </Pressable>
        </View>

        <ScrollView style={estilos.lista} contentContainerStyle={estilos.listaConteudo}>
          {GRUPOS.map(({ chave, titulo }) => (
            <GrupoFiltro
              key={chave}
              titulo={titulo}
              aberto={grupoAberto === chave}
              aoAlternar={() => setGrupoAberto(grupoAberto === chave ? null : chave)}
              opcoes={opcoes?.[chave] ?? []}
              selecionados={rascunho[chave] as string[]}
              aoAlternarOpcao={(valor) => alternarOpcao(chave, valor)}
            />
          ))}
        </ScrollView>

        {/* Ações */}
        <View style={estilos.acoes}>
          <Pressable
            onPress={() => aoAplicar(rascunho)}
            accessibilityRole="button"
            style={[estilos.botao, { backgroundColor: cores.botaoPrimarioFundo, borderColor: cores.borda }]}
          >
            <Text style={[estilos.textoBotao, { color: cores.botaoPrimarioTexto }]}>aplicar</Text>
          </Pressable>
          <Pressable
            onPress={() => setRascunho(FILTROS_VAZIOS)}
            accessibilityRole="button"
            style={[estilos.botao, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}
          >
            <Text style={[estilos.textoBotao, { color: cores.texto }]}>limpar filtros</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  sobreposicao: {
    flex: 1,
  },
  menu: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    maxHeight: '85%',
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textoTitulo: {
    fontFamily: fontes.semiBold,
    fontSize: 20,
  },
  lista: {
    flexGrow: 0,
  },
  listaConteudo: {
    gap: 0,
  },
  linha: {
    height: 1,
    width: '100%',
  },
  grupo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // 16 de cada lado = mesmo espaçamento entre linhas do Figma (gap 16).
    paddingVertical: 16,
  },
  textoGrupo: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  areaOpcoes: {
    overflow: 'hidden',
  },
  opcoes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
  },
  acoes: {
    flexDirection: 'row',
    gap: 16,
  },
  botao: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotao: {
    fontFamily: fontes.medium,
    fontSize: 14,
    textAlign: 'center',
  },
});
