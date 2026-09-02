import { PenLine } from "lucide-react";
import ToolbarDesktop from "./ToolbarDesktop";
import ToolbarMobile from "./ToolbarMobile";

function SignatureCanvasDesktop({
  canvasRef,
  canvasWrapperRef,
  startDrawing,
  draw,
  finishDrawing,
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
  painelFerramentasAberto,
  setPainelFerramentasAberto,
}) {
  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      <div className="absolute inset-0 p-5 sm:p-8">
        <div
          ref={canvasWrapperRef}
          className="relative h-full w-full rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white overflow-hidden shadow-sm transition-colors duration-300"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={finishDrawing}
            onPointerLeave={finishDrawing}
            onPointerCancel={finishDrawing}
            className="absolute inset-0 block w-full h-full touch-none bg-white cursor-crosshair"
          />

          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl px-5 py-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 transition-colors duration-300">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <PenLine className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight transition-colors">
                  Assinatura do colaborador
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
                  Assine livremente na área em branco.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolbarDesktop
        ferramentaAtiva={ferramentaAtiva}
        setFerramentaAtiva={setFerramentaAtiva}
        limparAssinatura={limparAssinatura}
        concluirAssinatura={concluirAssinatura}
        fecharAssinatura={fecharAssinatura}
        painelFerramentasAberto={painelFerramentasAberto}
        setPainelFerramentasAberto={setPainelFerramentasAberto}
      />
    </div>
  );
}

function SignatureCanvasMobile({
  canvasRef,
  canvasWrapperRef,
  startDrawing,
  draw,
  finishDrawing,
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
}) {
  return (
    <div className="h-full w-full flex bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-0 p-4 pr-2">
          <div
            ref={canvasWrapperRef}
            className="relative h-full w-full rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white overflow-hidden shadow-sm transition-colors duration-300"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={finishDrawing}
              onPointerLeave={finishDrawing}
              onPointerCancel={finishDrawing}
              className="absolute inset-0 block w-full h-full touch-none bg-white"
            />

            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 transition-colors duration-300">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <PenLine className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight transition-colors">
                    Assinatura
                  </h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 transition-colors uppercase tracking-widest mt-0.5">
                    Assine livremente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolbarMobile
        ferramentaAtiva={ferramentaAtiva}
        setFerramentaAtiva={setFerramentaAtiva}
        limparAssinatura={limparAssinatura}
        concluirAssinatura={concluirAssinatura}
        fecharAssinatura={fecharAssinatura}
      />
    </div>
  );
}

function ModalAssinatura({
  aberto,
  isMobileViewport,
  canvasRef,
  canvasWrapperRef,
  startDrawing,
  draw,
  finishDrawing,
  assinaturaVazia,
  ferramentaAtiva,
  setFerramentaAtiva,
  limparAssinatura,
  concluirAssinatura,
  fecharAssinatura,
  painelFerramentasAberto,
  setPainelFerramentasAberto,
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-[#0B1120] overflow-hidden animate-fade-in transition-colors duration-300">
      {isMobileViewport ? (
        <SignatureCanvasMobile
          canvasRef={canvasRef}
          canvasWrapperRef={canvasWrapperRef}
          startDrawing={startDrawing}
          draw={draw}
          finishDrawing={finishDrawing}
          assinaturaVazia={assinaturaVazia}
          ferramentaAtiva={ferramentaAtiva}
          setFerramentaAtiva={setFerramentaAtiva}
          limparAssinatura={limparAssinatura}
          concluirAssinatura={concluirAssinatura}
          fecharAssinatura={fecharAssinatura}
        />
      ) : (
        <SignatureCanvasDesktop
          canvasRef={canvasRef}
          canvasWrapperRef={canvasWrapperRef}
          startDrawing={startDrawing}
          draw={draw}
          finishDrawing={finishDrawing}
          assinaturaVazia={assinaturaVazia}
          ferramentaAtiva={ferramentaAtiva}
          setFerramentaAtiva={setFerramentaAtiva}
          limparAssinatura={limparAssinatura}
          concluirAssinatura={concluirAssinatura}
          fecharAssinatura={fecharAssinatura}
          painelFerramentasAberto={painelFerramentasAberto}
          setPainelFerramentasAberto={setPainelFerramentasAberto}
        />
      )}
    </div>
  );
}

export default ModalAssinatura;