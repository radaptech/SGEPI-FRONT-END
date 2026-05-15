import { useModalEntrega } from "../../../hooks/useModalEntrega";
import { useSignaturePad } from "../../../hooks/useSignaturePad";

import EntregaHeader from "./EntregaHeader";
import EntregaForm from "./EntregaForm";
import EntregaItensForm from "./EntregaItensForm";
import EntregaFooter from "./EntregaFooter";
import ModalAssinatura from "./ModalAssinatura";

function ModalEntrega({ onClose, onSalvar, funcionarios = [], epis = [] }) {
  const assinatura = useSignaturePad();

  const entrega = useModalEntrega({
    assinaturaPreview: assinatura.assinaturaPreview,
    onClose,
    onSalvar,
    funcionarios,
  });

  const handleMudancaEpi = (valor) => {
    entrega.setIdEpiTemp(valor);
    entrega.setIdTamanhoTemp("");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm text-slate-700">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
          <EntregaHeader onClose={onClose} />

          <div className="p-6 overflow-y-auto space-y-5">
            <EntregaForm
              carregandoDados={false}
              buscaFuncionario={entrega.buscaFuncionario}
              setBuscaFuncionario={entrega.setBuscaFuncionario}
              funcionariosFiltrados={entrega.funcionariosFiltrados}
              funcionario={entrega.funcionario}
              setFuncionario={entrega.setFuncionario}
              funcionarioSelecionado={entrega.funcionarioSelecionado}
              dataEntrega={entrega.dataEntrega}
              setDataEntrega={entrega.setDataEntrega}
              assinaturaPreview={assinatura.assinaturaPreview}
              limparAssinatura={assinatura.limparAssinatura}
              abrirAssinatura={assinatura.abrirModalAssinatura}
            />

            <EntregaItensForm
              epis={epis}
              tamanhos={entrega.tamanhosFiltrados || []}
              carregandoTamanhos={entrega.carregandoTamanhos}
              idEpiTemp={entrega.idEpiTemp}
              setIdEpiTemp={handleMudancaEpi}
              idTamanhoTemp={entrega.idTamanhoTemp}
              setIdTamanhoTemp={entrega.setIdTamanhoTemp}
              qtdTemp={entrega.qtdTemp}
              setQtdTemp={entrega.setQtdTemp}
              adicionarItem={entrega.adicionarItem}
              itensParaEntregar={entrega.itensParaEntregar}
              removerItem={entrega.removerItem}
              // 🌟 NOVO: Passando o objeto selecionado para o formulário travar a tela
              tamanhoSelecionadoObj={entrega.tamanhoSelecionadoObj}
            />
          </div>

          <EntregaFooter
            onClose={onClose}
            onSalvar={entrega.salvarEntrega}
            carregando={entrega.carregando}
          />
        </div>
      </div>

      <ModalAssinatura
        aberto={assinatura.modalAssinaturaAberto}
        isMobileViewport={assinatura.isMobileViewport}
        canvasRef={assinatura.canvasRef}
        canvasWrapperRef={assinatura.canvasWrapperRef}
        startDrawing={assinatura.startDrawing}
        draw={assinatura.draw}
        finishDrawing={assinatura.finishDrawing}
        assinaturaVazia={assinatura.assinaturaVazia}
        ferramentaAtiva={assinatura.ferramentaAtiva}
        setFerramentaAtiva={assinatura.setFerramentaAtiva}
        limparAssinatura={assinatura.limparAssinatura}
        concluirAssinatura={assinatura.concluirAssinatura}
        fecharAssinatura={assinatura.fecharModalAssinatura}
        painelFerramentasAberto={assinatura.painelFerramentasAberto}
        setPainelFerramentasAberto={assinatura.setPainelFerramentasAberto}
      />
    </>
  );
}

export default ModalEntrega;