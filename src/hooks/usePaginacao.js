import { useMemo } from "react";

export function usePaginacao(
  lista,
  paginaAtual,
  itensPorPagina
) {
  const totalPaginas = Math.max(
    1,
    Math.ceil(lista.length / itensPorPagina)
  );

  const itens = useMemo(() => {
    const inicio =
      (paginaAtual - 1) * itensPorPagina;

    const fim = inicio + itensPorPagina;

    return lista.slice(inicio, fim);
  }, [
    lista,
    paginaAtual,
    itensPorPagina,
  ]);

  return {
    itens,
    totalPaginas,
  };
}