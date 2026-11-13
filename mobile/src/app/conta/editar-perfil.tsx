/**
 * Editar perfil (Figma: claro 589:728 / escuro 599:1972).
 * Aberta pelo botão "editar perfil" da tela de perfil.
 *
 * - DADOS PESSOAIS: nome completo, e-mail e telefone;
 * - "salvar alterações" valida (mesmas regras do cadastro) e salva.
 *
 * O e-mail aparece só para leitura: tocar nele abre "Alterar e-mail", que
 * pede a senha (por segurança, a troca de e-mail fica em Segurança).
 */
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../components/Texto';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALTURA_BARRA_NAVEGACAO, BarraNavegacao } from '../../components/BarraNavegacao';
import { CabecalhoPagina } from '../../components/CabecalhoPagina';
import { CampoFormulario } from '../../components/CampoFormulario';
import { PainelAcaoInferior } from '../../components/PainelAcaoInferior';
import { atualizarPerfil, obterUsuarioAtual } from '../../services/authService';
import { useTema } from '../../theme/TemaContext';
import { fontes } from '../../theme/tipografia';
import { avisar } from '../../utils/avisos';
import { voltarOu } from '../../utils/navegacao';
import { mascararTelefone, somenteDigitos, validarNome, validarTelefone } from '../../utils/validacoes';

export default function TelaEditarPerfil() {
  const { cores, tema } = useTema();
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [alturaPainel, setAlturaPainel] = useState(0);

  // Preenche o formulário com os dados atuais.
  useEffect(() => {
    obterUsuarioAtual().then((u) => {
      if (!u) return;
      setNome(u.nome);
      setEmail(u.email);
      setTelefone(mascararTelefone(u.telefone));
    }).catch((erro: Error) => avisar('Não foi possível carregar o perfil', erro.message));
  }, []);

  const erros = tentouSalvar ? { nome: validarNome(nome), telefone: validarTelefone(telefone) } : null;

  async function salvar() {
    setTentouSalvar(true);
    if (validarNome(nome) || validarTelefone(telefone)) return;

    setSalvando(true);
    try {
      await atualizarPerfil({ nome: nome.trim().replace(/\s+/g, ' '), telefone: somenteDigitos(telefone) });
      avisar('Perfil atualizado', 'Seus dados foram salvos.');
      router.back();
    } catch (erro) {
      avisar('Não foi possível salvar', (erro as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <StatusBar style={tema === 'claro' ? 'dark' : 'light'} />
      <CabecalhoPagina titulo="Editar perfil" aoVoltar={() => voltarOu('/perfil')} />

      <ScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingBottom: alturaPainel + ALTURA_BARRA_NAVEGACAO + insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[estilos.tituloSecao, { color: cores.tituloSecaoSuave }]}>DADOS PESSOAIS</Text>

        <View style={estilos.formulario}>
          <CampoFormulario
            rotulo="Nome completo"
            placeholder="seu nome"
            value={nome}
            onChangeText={setNome}
            erro={erros?.nome}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
          <CampoFormulario
            rotulo="E-mail"
            value={email}
            somenteLeitura
            aoPressionar={() => router.push('/conta/alterar-email')}
            ajuda="Para trocar o e-mail, toque no campo (vai pedir sua senha)."
          />
          <CampoFormulario
            rotulo="Telefone"
            placeholder="(11) 99999-9999"
            value={telefone}
            onChangeText={(t) => setTelefone(mascararTelefone(t))}
            erro={erros?.telefone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={15}
          />
        </View>
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
  tituloSecao: {
    fontFamily: fontes.regular,
    fontSize: 14,
  },
  formulario: {
    gap: 16,
  },
});
