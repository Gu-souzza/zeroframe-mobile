/**
 * Alterar senha (Figma: claro 634:2489 / escuro 634:2680).
 * Aberta por Segurança → senha → "alterar".
 *
 * Regras:
 * - Senha atual: obrigatória (mínimo 6);
 * - Nova senha: mínimo 6 caracteres e diferente da atual;
 * - Confirmar: igual à nova senha.
 */
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { CampoFormulario } from '../../components/CampoFormulario';
import { PainelAcaoInferior } from '../../components/PainelAcaoInferior';
import { alterarSenha } from '../../services/authService';
import { useTema } from '../../theme/TemaContext';
import { fontes } from '../../theme/tipografia';
import { avisar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';
import { validarConfirmacaoSenha, validarSenha } from '../../utils/validacoes';

export default function TelaAlterarSenha() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [alturaPainel, setAlturaPainel] = useState(0);

  function validarNova(): string | null {
    const erro = validarSenha(nova);
    if (erro) return erro;
    if (nova === atual) return 'A nova senha deve ser diferente da atual.';
    return null;
  }

  const validar = () => ({
    atual: validarSenha(atual),
    nova: validarNova(),
    confirmacao: validarConfirmacaoSenha(nova, confirmacao),
  });
  const erros = tentouSalvar ? validar() : null;

  async function salvar() {
    setTentouSalvar(true);
    if (Object.values(validar()).some(Boolean)) return;

    setSalvando(true);
    try {
      await alterarSenha(atual, nova);
      avisar('Senha alterada', 'Use a nova senha no próximo acesso.');
      voltarOu('/conta/seguranca');
    } catch (erro) {
      avisar('Não foi possível alterar a senha', (erro as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  function esqueciSenha() {
    avisar('Recuperação indisponível', 'A recuperação por e-mail ainda não está disponível nesta versão.');
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Alterar senha" aoVoltar={() => voltarOu('/conta/seguranca')} />

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: alturaPainel + ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.formulario}>
          <CampoFormulario
            rotulo="Senha atual"
            placeholder="digite sua senha"
            value={atual}
            onChangeText={setAtual}
            erro={erros?.atual}
            senha
            mostrarOlho
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
          />
          <CampoFormulario
            rotulo="Nova senha"
            placeholder="mínimo 6 caracteres"
            value={nova}
            onChangeText={setNova}
            erro={erros?.nova}
            senha
            mostrarOlho
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <CampoFormulario
            rotulo="Confirmar a nova senha"
            placeholder="repita a nova senha"
            value={confirmacao}
            onChangeText={setConfirmacao}
            erro={erros?.confirmacao}
            senha
            mostrarOlho
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={salvar}
          />
        </View>

        <Pressable onPress={esqueciSenha} accessibilityRole="link" hitSlop={6} style={estilos.link}>
          <Text style={[estilos.textoLink, { color: cores.texto }]}>Esqueci minha senha atual</Text>
        </Pressable>
      </ScrollView>

      <PainelAcaoInferior titulo="salvar alterações" aoPressionar={salvar} carregando={salvando} aoMedir={setAlturaPainel} />
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
    gap: 10,
  },
  formulario: {
    gap: 8,
  },
  link: {
    alignSelf: 'flex-start',
  },
  textoLink: {
    fontFamily: fontes.regular,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
