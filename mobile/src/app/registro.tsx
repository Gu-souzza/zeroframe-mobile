/**
 * Tela de registro / criar conta (Figma: "Tela de registro" — claro 473:114 / escuro 480:198).
 *
 * Regras de preenchimento (ver src/utils/validacoes.ts):
 * - E-mail: formato válido;
 * - Telefone: com DDD, 10 (fixo) ou 11 dígitos (celular começando com 9).
 *   A máscara "(11) 98765-4321" é aplicada enquanto digita;
 * - Nome: nome e sobrenome, apenas letras;
 * - Senha: mínimo de 6 caracteres;
 * - Confirmar senha: igual à senha.
 *
 * Com tudo válido, chama `registrar()` (mock) e vai para a tela inicial.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../components/Texto';
import { router } from 'expo-router';

import { Botao } from '../components/Botao';
import { CabecalhoAutenticacao } from '../components/CabecalhoAutenticacao';
import { CampoTexto } from '../components/CampoTexto';
import { TelaFormulario } from '../components/TelaFormulario';
import { registrar } from '../services/authService';
import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import { avisar } from '../utils/avisos';
import {
  mascararTelefone,
  somenteDigitos,
  validarConfirmacaoSenha,
  validarEmail,
  validarNome,
  validarSenha,
  validarTelefone,
} from '../utils/validacoes';

export default function TelaRegistro() {
  const { cores, icones } = useTema();

  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const validar = () => ({
    email: validarEmail(email),
    telefone: validarTelefone(telefone),
    nome: validarNome(nome),
    senha: validarSenha(senha),
    confirmacao: validarConfirmacaoSenha(senha, confirmacao),
  });

  // Só mostra erros depois da primeira tentativa de criar a conta.
  const erros = tentouEnviar ? validar() : null;

  async function aoCriarConta() {
    setTentouEnviar(true);
    if (Object.values(validar()).some(Boolean)) return;

    setCarregando(true);
    try {
      await registrar({
        email: email.trim(),
        telefone: somenteDigitos(telefone), // API recebe só os dígitos
        nome: nome.trim().replace(/\s+/g, ' '),
        senha,
      });
    } catch (erro) {
      avisar('Não foi possível criar a conta', (erro as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  function irParaLogin() {
    // `replace` troca registro ↔ login sem empilhar telas: o voltar sempre leva às boas-vindas.
    router.replace('/login');
  }

  return (
    <TelaFormulario espacamento={64}>
      <CabecalhoAutenticacao />

      <View style={estilos.conteudo}>
        <View style={estilos.formulario}>
          <CampoTexto
            placeholder="digite seu email"
            icone={icones.arroba}
            value={email}
            onChangeText={setEmail}
            erro={erros?.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <CampoTexto
            placeholder="digite seu telefone"
            icone={icones.telefone}
            value={telefone}
            onChangeText={(texto) => setTelefone(mascararTelefone(texto))}
            erro={erros?.telefone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={15}
          />
          <CampoTexto
            placeholder="digite seu nome"
            icone={icones.usuario}
            value={nome}
            onChangeText={setNome}
            erro={erros?.nome}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
          <CampoTexto
            placeholder="mínimo 6 caracteres"
            senha
            value={senha}
            onChangeText={setSenha}
            erro={erros?.senha}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <CampoTexto
            placeholder="confirme sua senha"
            senha
            value={confirmacao}
            onChangeText={setConfirmacao}
            erro={erros?.confirmacao}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={aoCriarConta}
          />

          <Botao titulo="criar conta" aoPressionar={aoCriarConta} carregando={carregando} />
        </View>

        <View style={estilos.rodape}>
          <Text style={[estilos.legenda, { color: cores.legendaRegistro }]}>Já possui uma conta?</Text>
          <Botao titulo="fazer login" variante="secundario" aoPressionar={irParaLogin} />
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
  rodape: {
    width: '100%',
    gap: 5,
  },
  legenda: {
    fontFamily: fontes.regular,
    fontSize: 16,
  },
});
