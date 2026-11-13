/**
 * Alterar e-mail (Figma: claro 634:2481 / escuro 634:2660).
 * Aberta por Segurança → e-mail → "alterar" (ou pelo campo de e-mail em Editar perfil).
 *
 * Regras:
 * - Novo e-mail: formato válido e diferente do atual;
 * - Senha: obrigatória (mínimo 6) — confirma que é o dono da conta.
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { CampoFormulario } from '../../components/CampoFormulario';
import { Icone } from '../../components/Icone';
import { PainelAcaoInferior } from '../../components/PainelAcaoInferior';
import { alterarEmail, obterUsuarioAtual } from '../../services/authService';
import { useTema } from '../../theme/TemaContext';
import { iconesMonocromaticos } from '../../theme/icones';
import { fontes } from '../../theme/tipografia';
import { avisar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';
import { validarEmail, validarSenha } from '../../utils/validacoes';

export default function TelaAlterarEmail() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();

  const [emailAtual, setEmailAtual] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [alturaPainel, setAlturaPainel] = useState(0);

  useEffect(() => {
    obterUsuarioAtual().then((u) => setEmailAtual(u?.email ?? ''))
      .catch((erro: Error) => avisar('Não foi possível carregar o e-mail', erro.message));
  }, []);

  function validarNovoEmail(): string | null {
    const erro = validarEmail(novoEmail);
    if (erro) return erro;
    if (novoEmail.trim().toLowerCase() === emailAtual.toLowerCase()) return 'O novo e-mail é igual ao atual.';
    return null;
  }

  const erros = tentouSalvar ? { email: validarNovoEmail(), senha: validarSenha(senha) } : null;

  async function salvar() {
    setTentouSalvar(true);
    if (validarNovoEmail() || validarSenha(senha)) return;

    setSalvando(true);
    try {
      await alterarEmail(novoEmail.trim(), senha);
      avisar('E-mail alterado', `Agora você entra com ${novoEmail.trim()}.`);
      voltarOu('/conta/seguranca');
    } catch (erro) {
      avisar('Não foi possível alterar o e-mail', (erro as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Alterar e-mail" aoVoltar={() => voltarOu('/conta/seguranca')} />

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: alturaPainel + ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* E-mail atual */}
        <View style={[estilos.atual, { backgroundColor: cores.cardFundo, borderColor: cores.borda }]}>
          <Icone fonte={iconesMonocromaticos.envelope} largura={20} altura={16} tintColor={cores.texto} />
          <View style={estilos.infoAtual}>
            <Text style={[estilos.tituloAtual, { color: cores.texto }]}>e-mail atual</Text>
            <Text style={[estilos.valorAtual, { color: cores.tituloSecaoSuave }]} numberOfLines={1}>
              {emailAtual}
            </Text>
          </View>
        </View>

        <CampoFormulario
          rotulo="Novo e-mail"
          placeholder="nome@email.com"
          value={novoEmail}
          onChangeText={setNovoEmail}
          erro={erros?.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <CampoFormulario
          rotulo="Senha"
          placeholder="digite sua senha"
          value={senha}
          onChangeText={setSenha}
          erro={erros?.senha}
          senha
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={salvar}
        />
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
    gap: 16,
  },
  atual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 5,
  },
  infoAtual: {
    flex: 1,
    gap: 2,
  },
  tituloAtual: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
  valorAtual: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
});
