/**
 * Tela de pesquisa (Figma: claro 486:736 / escuro 505:328).
 *
 * - Campo "O que você está procurando?": ao enviar, abre os resultados;
 * - "Buscas recentes": pílulas que repetem a busca (o "x" remove o termo);
 * - "CATEGORIAS": cards de categoria. Tocar num card busca o nome da
 *   categoria, como se ele tivesse sido digitado no campo de busca.
 *
 * A seleção de gênero (Todos / Masculino / Feminino) fica só na tela de
 * resultados (src/app/resultados.tsx), não aqui.
 */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from '../components/Texto';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CampoBusca } from '../components/CampoBusca';
import { CardCategoria } from '../components/CardCategoria';
import { Icone } from '../components/Icone';
import { listarBuscasRecentes, listarCategorias, removerBuscaRecente } from '../services/produtosService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { Categoria } from '../types';
import { avisar } from '../utils/avisos';
import { abrirResultados } from '../utils/navegacao';

const LARGURA_MAXIMA = 480;
const ESPACO_GRADE = 16;

export default function TelaBuscar() {
  const { cores, icones, tema } = useTema();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [texto, setTexto] = useState('');
  const [recentes, setRecentes] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Recarrega as buscas recentes sempre que a tela volta a ficar visível
  // (o usuário pode ter feito novas buscas na tela de resultados).
  useFocusEffect(
    useCallback(() => {
      listarBuscasRecentes().then(setRecentes)
        .catch((erro: Error) => avisar('Não foi possível carregar as buscas recentes', erro.message));
    }, []),
  );

  useEffect(() => {
    listarCategorias().then(setCategorias)
      .catch((erro: Error) => avisar('Não foi possível carregar as categorias', erro.message));
  }, []);

  async function removerRecente(termo: string) {
    try {
      setRecentes(await removerBuscaRecente(termo));
    } catch (erro) {
      avisar('Não foi possível remover a busca', (erro as Error).message);
    }
  }

  const larguraConteudo = Math.min(width, LARGURA_MAXIMA) - 32;
  const tamanhoCard = (larguraConteudo - ESPACO_GRADE) / 2;

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingTop: Math.max(32, insets.top + 16), paddingBottom: ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Busca + buscas recentes */}
        <View style={estilos.secaoBusca}>
          <CampoBusca valor={texto} aoMudar={setTexto} aoBuscar={abrirResultados} />

          {recentes.length > 0 && (
            <>
              <Text style={[estilos.legenda, { color: cores.pilulaTexto }]}>Buscas recentes</Text>
              <View style={estilos.recentes}>
                {recentes.map((termo) => (
                  <View key={termo} style={[estilos.pilulaRecente, { backgroundColor: cores.pilulaFundo }]}>
                    <Pressable
                      onPress={() => abrirResultados(termo)}
                      accessibilityRole="button"
                      accessibilityLabel={`Buscar ${termo}`}
                    >
                      <Text style={[estilos.textoRecente, { color: cores.pilulaTexto }]}>{termo}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => removerRecente(termo)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${termo} das buscas recentes`}
                      hitSlop={10}
                    >
                      <Icone fonte={iconesMonocromaticos.xPilula} largura={7} altura={7} tintColor={cores.pilulaTexto} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Título "CATEGORIAS" + linha */}
        <View style={estilos.secaoTitulo}>
          <Text style={[estilos.titulo, { color: cores.texto }]}>CATEGORIAS</Text>
          <Icone fonte={icones.linhaDivisoria} largura={0} altura={1} style={estilos.linha} />
        </View>

        {/* Cards de categoria: tocar busca o nome da categoria */}
        <View style={estilos.grade}>
          {categorias.map((categoria) => (
            <CardCategoria
              key={categoria.id}
              categoria={categoria}
              tamanho={tamanhoCard}
              aoPressionar={(c) => abrirResultados(c.nome)}
            />
          ))}
        </View>
      </ScrollView>

      <BarraNavegacao ativo="buscar" />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  secaoBusca: {
    gap: 5,
  },
  legenda: {
    fontFamily: fontes.regular,
    fontSize: 12,
  },
  recentes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pilulaRecente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
  },
  textoRecente: {
    fontFamily: fontes.light,
    fontSize: 12,
  },
  secaoTitulo: {
    gap: 5,
  },
  titulo: {
    fontFamily: fontes.regular,
    fontSize: 20,
  },
  linha: {
    width: '100%',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ESPACO_GRADE,
  },
});
