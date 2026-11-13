/**
 * Tela de login (Figma: "Tela de login" — claro 471:51 / escuro 473:85).
 *
 * Regras de preenchimento:
 * - E-mail: obrigatório e em formato válido (nome@dominio.com);
 * - Senha: obrigatória, mínimo de 6 caracteres.
 * Os erros aparecem depois da primeira tentativa de envio e são
 * revalidados enquanto o usuário corrige o campo.
 *
 * Com os dados válidos, chama `entrar()` (mock) e vai para a tela inicial.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router } from 'expo-router';

import { Botao } from '../components/Botao';
import { CabecalhoAutenticacao } from '../components/CabecalhoAutenticacao';
import { CampoTexto } from '../components/CampoTexto';
import { TelaFormulario } from '../components/TelaFormulario';
import { entrar } from '../services/authService';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { validarEmail, validarSenha } from '../utils/validacoes';
import { avisar } from '../utils/avisos';

export default function TelaLogin() {
  const { cores, icones } = useTema();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Só mostra erros depois que o usuário tentou entrar pela primeira vez.
  const erros = {
    email: tentouEnviar ? validarEmail(email) : null,
    senha: tentouEnviar ? validarSenha(senha) : null,
  };

  async function aoEntrar() {
    setTentouEnviar(true);
    if (validarEmail(email) || validarSenha(senha)) return;

    setCarregando(true);
    try {
      await entrar({ email: email.trim(), senha });
    } catch (erro) {
      avisar('Não foi possível entrar', (erro as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  function aoEsquecerSenha() {
    avisar('Esqueci minha senha', 'A recuperação de senha estará disponível em breve.');
  }

  return (
    <TelaFormulario espacamento={80}>
      <CabecalhoAutenticacao />

      {/* Conteúdo: formulário no topo, "Não possui uma conta?" no rodapé */}
      <View style={estilos.conteudo}>
        <View style={estilos.formulario}>
          <View style={estilos.campos}>
            <CampoTexto
              placeholder="digite seu email"
              icone={icones.usuario}
              value={email}
              onChangeText={setEmail}
              erro={erros.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <CampoTexto
              placeholder="digite sua senha"
              senha
              value={senha}
              onChangeText={setSenha}
              erro={erros.senha}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={aoEntrar}
            />
            <Pressable onPress={aoEsquecerSenha} accessibilityRole="link" hitSlop={6}>
              <Text style={[estilos.link, { color: cores.texto }]}>Esqueci minha senha</Text>
            </Pressable>
          </View>

          <Botao titulo="entrar na conta" aoPressionar={aoEntrar} carregando={carregando} />
        </View>

        <View style={estilos.rodape}>
          <Text style={[estilos.legenda, { color: cores.texto }]}>Não possui uma conta?</Text>
          {/* `replace` troca login ↔ registro sem empilhar telas: o voltar sempre leva às boas-vindas. */}
          <Botao titulo="criar uma conta" variante="secundario" aoPressionar={() => router.replace('/registro')} />
        </View>
      </View>
    </TelaFormulario>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    gap: 32,
  },
  formulario: {
    width: '100%',
    gap: 10,
  },
  campos: {
    width: '100%',
    gap: 10,
  },
  link: {
    fontFamily: fontes.regular,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  rodape: {
    width: '100%',
    gap: 10,
  },
  legenda: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
});
