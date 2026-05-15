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
    <div className="absolute inset-0 bg-slate-100">
      <div className="absolute inset-0 p-5">
        <div
          ref={canvasWrapperRef}
          className="relative h-full w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
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

          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-slate-200">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Assinatura do colaborador
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Assine livremente na área branca.
              </p>
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
    <div className="h-full w-full flex bg-slate-100">
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-0 p-3 pr-2">
          <div
            ref={canvasWrapperRef}
            className="relative h-full w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
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

            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800">
                  Assinatura
                </h3>
                <p className="text-[10px] text-slate-500">
                  Assine livremente.
                </p>
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
    <div className="fixed inset-0 z-[100] bg-slate-100 overflow-hidden">
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