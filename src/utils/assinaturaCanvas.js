export function preencherCanvasBranco(ctx, largura, altura) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, largura, altura);
}

export function aplicarFerramentaNoContexto(ctx, ferramenta = "caneta") {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = "source-over";

  if (ferramenta === "borracha") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 22;
    return;
  }

  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.8;
}

export function canvasEstaEmBranco(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return true;

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (r !== 255 || g !== 255 || b !== 255 || a !== 255) {
      return false;
    }
  }

  return true;
}

export function encontrarLimitesDesenho(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const pixelEhBranco = r === 255 && g === 255 && b === 255 && a === 255;

      if (!pixelEhBranco) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) return null;

  return { minX, minY, maxX, maxY };
}

export function gerarAssinaturaAjustada(canvasOriginal) {
  const limites = encontrarLimitesDesenho(canvasOriginal);
  if (!limites) return "";

  const padding = 22;

  const sx = Math.max(0, limites.minX - padding);
  const sy = Math.max(0, limites.minY - padding);
  const sw = Math.min(
    canvasOriginal.width - sx,
    limites.maxX - limites.minX + padding * 2
  );
  const sh = Math.min(
    canvasOriginal.height - sy,
    limites.maxY - limites.minY + padding * 2
  );

  if (sw <= 0 || sh <= 0) return "";

  const canvasFinal = document.createElement("canvas");
  canvasFinal.width = sw;
  canvasFinal.height = sh;

  const ctxFinal = canvasFinal.getContext("2d");
  if (!ctxFinal) return "";

  preencherCanvasBranco(ctxFinal, sw, sh);
  ctxFinal.drawImage(canvasOriginal, sx, sy, sw, sh, 0, 0, sw, sh);

  return canvasFinal.toDataURL("image/png");
}