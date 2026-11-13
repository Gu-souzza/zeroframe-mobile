/**
 * Ajuda e suporte (Figma: claro 634:1774 / escuro 634:2168).
 *
 * Aberta pelo item "ajuda e suporte" do perfil e pelo botão "preciso de
 * ajuda com este pedido" (detalhes do pedido). Neste caso a rota recebe
 * `categoria=pedido`, `pedido=<id>` e `assunto=Pedido #0002`, já preenchidos.
 *
 * - "Sobre o que você precisa de ajuda?*": 6 opções (uma selecionável);
 * - Assunto* e Mensagem*;
 * - Card "Horário de Atendimento";
 * - "enviar mensagem".
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '../components/Texto';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../components/BarraNavegacao';
import { CabecalhoPagina } from '../components/CabecalhoPagina';
import { CampoFormulario } from '../components/CampoFormulario';
import { Icone } from '../components/Icone';
import { PainelAcaoInferior } from '../components/PainelAcaoInferior';
import { HORARIO_ATENDIMENTO, enviarMensagemSuporte } from '../services/suporteService';
import { useTema } from '../theme/TemaContext';
import { iconesMonocromaticos } from '../theme/icones';
import { fontes } from '../theme/tipografia';
import type { CategoriaSuporte, Imagem } from '../types';
import { avisar } from '../utils/avisos';
import { voltarOu } from '../utils/navegacao';

/** Opções de categoria, na ordem do Figma (ícone com o tamanho do arquivo exportado). */
const CATEGORIAS: { id: CategoriaSuporte; rotulo: string; icone: Imagem; largura: number }[] = [
  { id: 'pedido', rotulo: 'pedido', icone: iconesMonocromaticos.suportePedido, largura: 14 },
  { id: 'produto', rotulo: 'produto', icone: iconesMonocromaticos.suporteProduto, largura: 17 },
  { id: 'entrega', rotulo: 'entrega', icone: iconesMonocromaticos.suporteEntrega, largura: 20 },
  { id: 'pagamento', rotulo: 'pagamento', icone: iconesMonocromaticos.suportePagamento, largura: 20 },
  { id: 'conta', rotulo: 'conta', icone: iconesMonocromaticos.suporteConta, largura: 11 },
  { id: 'outro', rotulo: 'outro', icone: iconesMonocromaticos.suporteOutro, largura: 10 },
];

const ASSUNTO_MINIMO = 3;
const MENSAGEM_MINIMA = 10;

export default function TelaSuporte() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoria?: CategoriaSuporte; pedido?: string; assunto?: string }>();

  const [categoria, setCategoria] = useState<CategoriaSuporte | null>(params.categoria ?? null);
  const [assunto, setAssunto] = useState(params.assunto ?? '');
  const [mensagem, setMensagem] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [alturaPainel, setAlturaPainel] = useState(0);

  const validar = () => ({
    categoria: categoria ? null : 'Escolha um assunto.',
    assunto: assunto.trim().length >= ASSUNTO_MINIMO ? null : 'Escreva um assunto.',
    mensagem:
      mensagem.trim().length >= MENSAGEM_MINIMA
        ? null
        : `Descreva o problema (mínimo ${MENSAGEM_MINIMA} caracteres).`,
  });
  const erros = tentouEnviar ? validar() : null;

  async function enviar() {
    setTentouEnviar(true);
    if (Object.values(validar()).some(Boolean) || !categoria) return;

    setEnviando(true);
    try {
      const { protocolo } = await enviarMensagemSuporte({
        categoria,
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        pedidoId: params.pedido,
      });
      avisar('Mensagem enviada', `Protocolo #${protocolo}. Responderemos pelo seu e-mail no horário de atendimento.`);
      voltarOu('/perfil');
    } catch (erro) {
      avisar('Não foi possível enviar', (erro as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Ajuda e suporte" aoVoltar={() => voltarOu('/perfil')} />

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: alturaPainel + ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.bloco}>
          <Text style={[estilos.rotulo, { color: cores.texto }]}>Sobre o que você precisa de ajuda?*</Text>
          <View style={estilos.categorias}>
            {CATEGORIAS.map((c) => {
              const selecionada = categoria === c.id;
              const corConteudo = selecionada ? cores.textoSobreSecundario : cores.texto;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoria(c.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selecionada }}
                  accessibilityLabel={c.rotulo}
                  style={[
                    estilos.categoria,
                    {
                      backgroundColor: selecionada ? cores.secundario : cores.cardFundo,
                      borderColor: erros?.categoria ? cores.erro : cores.borda,
                    },
                  ]}
                >
                  <Icone fonte={c.icone} largura={c.largura} altura={16} tintColor={corConteudo} />
                  <Text style={[estilos.textoCategoria, { color: corConteudo }]}>{c.rotulo}</Text>
                </Pressable>
              );
            })}
          </View>
          {erros?.categoria ? <Text style={[estilos.erro, { color: cores.erro }]}>{erros.categoria}</Text> : null}
        </View>

        <CampoFormulario
          rotulo="Assunto*"
          placeholder="resuma em poucas palavras"
          value={assunto}
          onChangeText={setAssunto}
          erro={erros?.assunto}
          maxLength={80}
        />

        <View style={estilos.bloco}>
          <Text style={[estilos.rotulo, { color: cores.texto }]}>Mensagem*</Text>
          <TextInput
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="descreva o problema com o máximo de detalhes"
            placeholderTextColor={cores.placeholder}
            multiline
            textAlignVertical="top"
            maxLength={1000}
            accessibilityLabel="Mensagem"
            style={[
              estilos.mensagem,
              {
                backgroundColor: cores.cardFundo,
                borderColor: erros?.mensagem ? cores.erro : cores.borda,
                color: cores.texto,
              },
            ]}
          />
          {erros?.mensagem ? <Text style={[estilos.erro, { color: cores.erro }]}>{erros.mensagem}</Text> : null}
        </View>

        {/* Horário de atendimento */}
        <View style={[estilos.horario, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
          <Icone fonte={iconesMonocromaticos.relogio} largura={20} altura={20} tintColor={cores.texto} />
          <View style={estilos.textosHorario}>
            <Text style={[estilos.tituloHorario, { color: cores.texto }]}>Horário de Atendimento</Text>
            <Text style={[estilos.valorHorario, { color: cores.tituloSecaoSuave }]}>{HORARIO_ATENDIMENTO}</Text>
          </View>
        </View>
      </ScrollView>

      <PainelAcaoInferior titulo="enviar mensagem" aoPressionar={enviar} carregando={enviando} aoMedir={setAlturaPainel} />
      <BarraNavegacao ativo="perfil" />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  bloco: {
    gap: 8,
  },
  rotulo: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoria: {
    // Duas colunas com 8px de espaço entre elas.
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  textoCategoria: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  erro: {
    fontFamily: fontes.regular,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  mensagem: {
    height: 192,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    fontFamily: fontes.regular,
    fontSize: 14,
    // Remove o contorno de foco do navegador na web ('none' só existe na web).
    outlineStyle: 'none' as 'solid',
  },
  horario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  textosHorario: {
    flex: 1,
    gap: 2,
  },
  tituloHorario: {
    fontFamily: fontes.medium,
    fontSize: 16,
  },
  valorHorario: {
    fontFamily: fontes.light,
    fontSize: 14,
  },
});
