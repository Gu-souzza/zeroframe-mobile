/**
 * Formulário de endereço (Figma: "Novo endereço" 634:1044/634:1121 e
 * "Editar endereço" 634:1189/634:1228). Usado pelas duas telas.
 *
 * - CEP + botão "buscar": preenche rua, bairro, cidade e UF (o usuário
 *   ainda pode corrigir tudo à mão);
 * - Rua*, Número*, Complemento (opcional), Bairro*, Cidade*, UF*;
 * - "Usar como endereço principal".
 *
 * Validação ao salvar: campos com * obrigatórios, CEP com 8 dígitos e UF
 * com 2 letras de um estado brasileiro.
 */
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from './Texto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buscarCep } from '../services/enderecosService';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import type { Endereco } from '../types';
import { ALTURA_BARRA_NAVEGACAO } from './BarraNavegacao';
import { CaixaSelecao } from './CaixaSelecao';
import { PainelAcaoInferior } from './PainelAcaoInferior';

export type DadosFormularioEndereco = Endereco & { principal: boolean };

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

/** "01310100" → "01310-100" enquanto digita. */
function mascararCep(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

const VAZIO: DadosFormularioEndereco = {
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', principal: false,
};

type Erros = Partial<Record<keyof Endereco, string>>;

function validar(d: DadosFormularioEndereco): Erros {
  const erros: Erros = {};
  if (d.cep.replace(/\D/g, '').length !== 8) erros.cep = 'Informe um CEP com 8 dígitos.';
  if (!d.rua.trim()) erros.rua = 'Informe a rua.';
  if (!d.numero.trim()) erros.numero = 'Obrigatório.';
  if (!d.bairro.trim()) erros.bairro = 'Informe o bairro.';
  if (!d.cidade.trim()) erros.cidade = 'Informe a cidade.';
  if (!UFS.includes(d.uf.trim().toUpperCase())) erros.uf = 'UF inválida.';
  return erros;
}

interface FormularioEnderecoProps {
  /** Dados iniciais (edição). Sem isso, o formulário começa vazio (novo endereço). */
  inicial?: DadosFormularioEndereco;
  textoBotao: string;
  aoSalvar: (dados: DadosFormularioEndereco) => Promise<void>;
}

export function FormularioEndereco({ inicial, textoBotao, aoSalvar }: FormularioEnderecoProps) {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();

  const [dados, setDados] = useState<DadosFormularioEndereco>(inicial ?? VAZIO);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState<string | null>(null);
  const [alturaPainel, setAlturaPainel] = useState(0);

  const erros = tentouSalvar ? validar(dados) : {};
  const alterar = (campo: keyof DadosFormularioEndereco) => (valor: string) =>
    setDados((atual) => ({ ...atual, [campo]: valor }));

  async function aoBuscarCep() {
    setErroCep(null);
    setBuscando(true);
    try {
      const encontrado = await buscarCep(dados.cep);
      setDados((atual) => ({ ...atual, ...encontrado }));
    } catch (erro) {
      setErroCep((erro as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  async function salvar() {
    setTentouSalvar(true);
    if (Object.keys(validar(dados)).length > 0) return;
    setSalvando(true);
    try {
      await aoSalvar({
        ...dados,
        rua: dados.rua.trim(),
        numero: dados.numero.trim(),
        complemento: dados.complemento?.trim() || undefined,
        bairro: dados.bairro.trim(),
        cidade: dados.cidade.trim(),
        uf: dados.uf.trim().toUpperCase(),
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: alturaPainel + ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* CEP + buscar */}
        <View style={estilos.campo}>
          <Text style={[estilos.rotulo, { color: cores.texto }]}>CEP</Text>
          <View style={estilos.linhaCep}>
            <Entrada
              valor={dados.cep}
              aoMudar={(v) => alterar('cep')(mascararCep(v))}
              placeholder="00000-000"
              accessibilityLabel="CEP"
              erro={!!(erros.cep || erroCep)}
              keyboardType="number-pad"
              autoComplete="postal-code"
              flex
            />
            <Pressable
              onPress={aoBuscarCep}
              disabled={buscando}
              accessibilityRole="button"
              accessibilityLabel="Buscar CEP"
              style={[estilos.botaoBuscar, { backgroundColor: cores.secundario, borderColor: cores.borda }]}
            >
              {buscando ? <ActivityIndicator color="#F5EBE0" /> : <Text style={estilos.textoBuscar}>buscar</Text>}
            </Pressable>
          </View>
          <Text style={[estilos.ajuda, { color: erroCep || erros.cep ? cores.erro : cores.tituloSecaoSuave }]}>
            {erroCep ?? erros.cep ?? 'Ao buscar, rua, bairro, cidade e UF são preenchidos.'}
          </Text>
        </View>

        <Campo rotulo="Rua*" erro={erros.rua}>
          <Entrada valor={dados.rua} aoMudar={alterar('rua')} erro={!!erros.rua} autoComplete="street-address" accessibilityLabel="Rua" />
        </Campo>

        <View style={estilos.linha}>
          <Campo rotulo="Número*" erro={erros.numero} largura={100}>
            <Entrada valor={dados.numero} aoMudar={alterar('numero')} erro={!!erros.numero} keyboardType="number-pad" accessibilityLabel="Número" />
          </Campo>
          <Campo rotulo="Complemento (opcional)" flex>
            <Entrada valor={dados.complemento ?? ''} aoMudar={alterar('complemento')} accessibilityLabel="Complemento" />
          </Campo>
        </View>

        <Campo rotulo="Bairro*" erro={erros.bairro}>
          <Entrada valor={dados.bairro} aoMudar={alterar('bairro')} erro={!!erros.bairro} accessibilityLabel="Bairro" />
        </Campo>

        <View style={estilos.linha}>
          <Campo rotulo="Cidade*" erro={erros.cidade} flex>
            <Entrada valor={dados.cidade} aoMudar={alterar('cidade')} erro={!!erros.cidade} accessibilityLabel="Cidade" />
          </Campo>
          <Campo rotulo="UF*" erro={erros.uf} largura={100}>
            <Entrada
              valor={dados.uf}
              aoMudar={(v) => alterar('uf')(v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
              erro={!!erros.uf}
              autoCapitalize="characters"
              maxLength={2}
              accessibilityLabel="UF"
            />
          </Campo>
        </View>

        {/* Principal */}
        <Pressable
          onPress={() => setDados((atual) => ({ ...atual, principal: !atual.principal }))}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: dados.principal }}
          style={estilos.principal}
          hitSlop={8}
        >
          <CaixaSelecao marcada={dados.principal} tamanho={16} />
          <Text style={[estilos.textoPrincipal, { color: cores.texto }]}>Usar como endereço principal</Text>
        </Pressable>
      </ScrollView>

      <PainelAcaoInferior titulo={textoBotao} aoPressionar={salvar} carregando={salvando} aoMedir={setAlturaPainel} />
    </>
  );
}

/** Rótulo + campo + mensagem de erro. */
function Campo({
  rotulo,
  erro,
  largura,
  flex,
  children,
}: {
  rotulo: string;
  erro?: string;
  largura?: number;
  flex?: boolean;
  children: React.ReactNode;
}) {
  const { cores } = useTema();
  return (
    <View style={[estilos.campo, largura ? { width: largura } : null, flex && estilos.flex]}>
      <Text style={[estilos.rotulo, { color: cores.texto }]}>{rotulo}</Text>
      {children}
      {erro ? <Text style={[estilos.ajuda, { color: cores.erro }]}>{erro}</Text> : null}
    </View>
  );
}

/** Caixa de texto do formulário (Figma: "input", 42px, raio 10, texto 14). */
function Entrada({
  valor,
  aoMudar,
  erro,
  flex,
  ...props
}: {
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: boolean;
  flex?: boolean;
} & Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText' | 'style'>) {
  const { cores } = useTema();
  return (
    <TextInput
      {...props}
      value={valor}
      onChangeText={aoMudar}
      placeholderTextColor={cores.placeholder}
      style={[
        estilos.entrada,
        { backgroundColor: cores.cardFundo, borderColor: erro ? cores.erro : cores.borda, color: cores.texto },
        flex && estilos.flex,
      ]}
    />
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  campo: {
    gap: 2,
  },
  flex: {
    flex: 1,
  },
  rotulo: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  linhaCep: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  botaoBuscar: {
    minWidth: 86,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBuscar: {
    fontFamily: fontes.medium,
    fontSize: 16,
    color: '#F5EBE0', // Figma: fixo nos dois temas
  },
  ajuda: {
    fontFamily: fontes.regular,
    fontSize: 12,
    marginTop: 3,
  },
  linha: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  entrada: {
    height: 42,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    fontFamily: fontes.regular,
    fontSize: 14,
    // Remove o contorno de foco do navegador na web ('none' só existe na web).
    outlineStyle: 'none' as 'solid',
  },
  principal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  textoPrincipal: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
});
