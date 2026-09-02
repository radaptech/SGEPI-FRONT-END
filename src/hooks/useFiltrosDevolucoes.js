import { useMemo } from "react";

export function useFiltrosDevolucoes(
  devolucoes,
  busca,
  dataInicio,
  dataFim,
  filtroTroca
) {
  return useMemo(() => {
    const termo = busca.toLowerCase().trim();

    let lista = devolucoes.filter((d) => {
      const texto =
        !termo ||
        d.funcionarioNome?.toLowerCase().includes(termo) ||
        d.epiNome?.toLowerCase().includes(termo);

      const data = String(
        d.data_devolucao || ""
      ).substring(0, 10);

      let periodo = true;

      if (dataInicio) {
        periodo = periodo && data >= dataInicio;
      }

      if (dataFim) {
        periodo = periodo && data <= dataFim;
      }

      return texto && periodo;
    });

    if (filtroTroca === "com_troca") {
      lista = lista.filter((d) => d.houveTroca);
    }

    if (filtroTroca === "sem_troca") {
      lista = lista.filter((d) => !d.houveTroca);
    }

    return lista.sort(
      (a, b) =>
        new Date(b.data_devolucao) -
        new Date(a.data_devolucao)
    );
  }, [
    devolucoes,
    busca,
    dataInicio,
    dataFim,
    filtroTroca,
  ]);
}