/**
 * Linha do tempo da entrega (Figma: "Estagio da entrega").
 *
 * Etapas: Pedido recebido → Preparando para saída → Saiu para entrega → Entregue.
 * - Concluída: círculo marrom com ✓ (ícone do Figma, um por tema) e a data/hora;
 *   a linha grossa liga até a próxima etapa concluída;
 * - Etapa atual (última concluída): texto em negrito e linha fina até a próxima;
 * - Pendente: círculo vazado e texto apagado (na entrega, mostra a previsão).
 * Pedido cancelado: "Pedido recebido" e depois "Pedido cancelado".
 */
import { StyleSheet, View } from 'react-native';
import { Text } from './Texto';

import { useTema } from '../theme/TemaContext';
import { fontes } from '../theme/tipografia';
import type { EtapasPedido, Pedido, StatusPedido } from '../types';
import { formatarDiaHora, formatarDiaMes } from '../utils/datas';
import { Icone } from './Icone';

interface Etapa {
  rotulo: string;
  /** Texto pequeno embaixo (data/hora ou previsão). */
  detalhe?: string;
  concluida: boolean;
}

/** Quantas etapas já foram concluídas em cada status. */
const ETAPAS_CONCLUIDAS: Record<StatusPedido, number> = {
  pendente: 1,
  preparando: 2,
  saiu_para_entrega: 3,
  entregue: 4,
  concluido: 4,
  cancelado: 1,
};

const NOMES_ETAPAS: { chave: keyof EtapasPedido; rotulo: string }[] = [
  { chave: 'recebido', rotulo: 'Pedido recebido' },
  { chave: 'preparando', rotulo: 'Preparando para saída' },
  { chave: 'saiuParaEntrega', rotulo: 'Saiu para entrega' },
  { chave: 'entregue', rotulo: 'Entregue' },
];

/** Monta a lista de etapas exibidas para um pedido. */
function montarEtapas(pedido: Pedido): Etapa[] {
  const concluidas = ETAPAS_CONCLUIDAS[pedido.status];
  const datas = { recebido: pedido.criadoEm, ...pedido.etapas };

  if (pedido.status === 'cancelado') {
    return [
      { rotulo: 'Pedido recebido', detalhe: formatarDiaHora(datas.recebido), concluida: true },
      { rotulo: 'Pedido cancelado', concluida: false },
    ];
  }

  return NOMES_ETAPAS.map(({ chave, rotulo }, i) => {
    const concluida = i < concluidas;
    const data = datas[chave];
    let detalhe: string | undefined;
    if (concluida && data) detalhe = formatarDiaHora(data);
    else if (chave === 'entregue' && pedido.previsaoEntrega) {
      detalhe = `Previsão de entrega: ${formatarDiaMes(pedido.previsaoEntrega)}`;
    }
    return { rotulo, detalhe, concluida };
  });
}

/** Altura de cada linha da linha do tempo (círculo 24 + traço até a próxima). */
const ALTURA_LINHA = 40;

export function LinhaDoTempoPedido({ pedido }: { pedido: Pedido }) {
  const { cores, icones } = useTema();
  const etapas = montarEtapas(pedido);
  const indiceAtual = etapas.filter((e) => e.concluida).length - 1;

  return (
    <View style={estilos.lista}>
      {etapas.map((etapa, i) => {
        const ultimaDaLista = i === etapas.length - 1;
        const atual = i === indiceAtual;

        let marcador;
        if (etapa.concluida) {
          // Última etapa concluída antes de uma pendente: ícone com linha fina.
          const fonte = atual && !ultimaDaLista ? icones.etapaConcluidaUltima : icones.etapaConcluida;
          marcador = (
            // Na última etapa da lista não há traço: o recorte mostra só o círculo.
            <View style={[estilos.marcador, ultimaDaLista && estilos.recorteCirculo]}>
              <Icone fonte={fonte} largura={24} altura={atual && !ultimaDaLista ? 40.5 : 41} />
            </View>
          );
        } else {
          marcador = (
            <View style={estilos.marcador}>
              <View style={[estilos.circuloPendente, { borderColor: cores.placeholder }]} />
              {!ultimaDaLista && <View style={[estilos.tracoPendente, { backgroundColor: cores.placeholder }]} />}
            </View>
          );
        }

        return (
          <View key={etapa.rotulo} style={estilos.linha}>
            {marcador}
            <View style={estilos.textos}>
              <Text
                style={[
                  estilos.rotulo,
                  {
                    color: etapa.concluida ? cores.texto : cores.tituloSecaoSuave,
                    fontFamily: atual ? fontes.semiBold : fontes.regular,
                  },
                ]}
              >
                {etapa.rotulo}
              </Text>
              {etapa.detalhe ? (
                <Text style={[estilos.detalhe, { color: cores.tituloSecaoSuave }]}>{etapa.detalhe}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: 2,
  },
  linha: {
    flexDirection: 'row',
    gap: 16,
    minHeight: ALTURA_LINHA,
  },
  marcador: {
    width: 24,
    alignItems: 'center',
  },
  recorteCirculo: {
    height: 24,
    overflow: 'hidden',
  },
  circuloPendente: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tracoPendente: {
    width: 1,
    height: ALTURA_LINHA - 24,
  },
  textos: {
    flex: 1,
    paddingTop: 2,
  },
  rotulo: {
    fontSize: 14,
  },
  detalhe: {
    fontFamily: fontes.light,
    fontSize: 10,
  },
});
