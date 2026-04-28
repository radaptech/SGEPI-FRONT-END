import React, { useEffect, useMemo, useRef, useState } from "react";

function Header({ paginaAtual, setPagina, onLogout, usuario }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);
  const menuMaisRef = useRef(null);

  const perfilUsuario = useMemo(() => {
    return (
      usuario?.tipo ||
      usuario?.perfil ||
      usuario?.role ||
      usuario?.nivelAcesso ||
      usuario?.usuario?.tipo ||
      usuario?.usuario?.perfil ||
      usuario?.usuario?.role ||
      "FUNCIONARIO"
    );
  }, [usuario]);

  const nomeUsuario = useMemo(() => {
    return usuario?.nome || usuario?.usuario?.nome || "Usuário";
  }, [usuario]);

  const perfilNormalizado = String(perfilUsuario).toUpperCase();

  const isSuperAdmin =
    perfilNormalizado === "SUPER_ADMIN" ||
    perfilNormalizado === "MASTER" ||
    perfilNormalizado === "ADMIN_MASTER";

  const isAdminEmpresa =
    perfilNormalizado === "ADMIN_EMPRESA" ||
    perfilNormalizado === "ADMIN";

  const isFuncionario =
    perfilNormalizado === "FUNCIONARIO" ||
    perfilNormalizado === "COLABORADOR";

  useEffect(() => {
    function handleClickFora(event) {
      if (menuMaisRef.current && !menuMaisRef.current.contains(event.target)) {
        setMenuMaisAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  function Botao({ label, icone, nomePagina, isMobile = false }) {
    const ativo = paginaAtual === nomePagina;

    return (
      <button
        type="button"
        onClick={() => {
          setPagina(nomePagina);
          setMenuMaisAberto(false);
          if (isMobile) setMenuAberto(false);
        }}
        className={`
          shrink-0 flex items-center gap-2.5 rounded-xl font-medium whitespace-nowrap transition-all
          ${
            isMobile
              ? "w-full justify-start px-4 py-3 text-sm"
              : "px-4 py-2.5 text-sm"
          }
          ${
            ativo
              ? "bg-white text-blue-900 shadow-md"
              : "text-blue-100 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <span className="shrink-0">{icone}</span>
        <span>{label}</span>
      </button>
    );
  }

  const IconDashboard = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );

  const IconEstoque = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  const IconFuncionarios = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-1a4 4 0 00-5-3.87M9 20H4v-1a4 4 0 015-3.87m8-6.13a4 4 0 11-8 0 4 4 0 018 0zm6 2a3 3 0 11-6 0 3 3 0 016 0zM6 10a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const IconDepartamentos = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"
      />
    </svg>
  );

  const IconFornecedores = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );

  const IconEntradas = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14"
      />
    </svg>
  );

  const IconEntregas = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const IconDevolucoes = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M19.419 15H15"
      />
    </svg>
  );

  const IconAdmin = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.983 5.5a1.5 1.5 0 013.034 0l.18 1.271a1.5 1.5 0 001.19 1.25l1.26.252a1.5 1.5 0 01.597 2.69l-1.02.78a1.5 1.5 0 00-.5 1.683l.41 1.218a1.5 1.5 0 01-2.198 1.77l-1.116-.666a1.5 1.5 0 00-1.54 0l-1.116.666a1.5 1.5 0 01-2.198-1.77l.41-1.218a1.5 1.5 0 00-.5-1.683l-1.02-.78a1.5 1.5 0 01.597-2.69l1.26-.252a1.5 1.5 0 001.19-1.25l.18-1.271zM13.5 13a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </svg>
  );

  const IconEmpresa = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 21h18M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1"
      />
    </svg>
  );

  const IconFinanceiro = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const IconPlanos = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-3 2-3-2-4 2V6a2 2 0 012-2z"
      />
    </svg>
  );

  const IconUsuario = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A9 9 0 1118.879 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const itensSuperAdmin = [
    {
      label: "Painel Master",
      nome: "DashboardMaster",
      principal: true,
      icon: IconDashboard,
    },
    {
      label: "Empresas",
      nome: "Empresas",
      principal: true,
      icon: IconEmpresa,
    },
    {
      label: "Mensalidades",
      nome: "Mensalidades",
      principal: true,
      icon: IconFinanceiro,
    },
    {
      label: "Planos",
      nome: "Planos",
      principal: true,
      icon: IconPlanos,
    },
    {
      label: "Usuários",
      nome: "UsuariosMaster",
      principal: true,
      icon: IconUsuario,
    },
  ];

  const itensAdminEmpresa = [
    {
      label: "Dashboard",
      nome: "Dashboard",
      principal: true,
      icon: IconDashboard,
    },
    {
      label: "Estoque",
      nome: "Estoque",
      principal: true,
      icon: IconEstoque,
    },
    {
      label: "Funcionários",
      nome: "Funcionários",
      principal: true,
      icon: IconFuncionarios,
    },
    {
      label: "Departamentos",
      nome: "Departamentos",
      principal: true,
      icon: IconDepartamentos,
    },
    {
      label: "Fornecedores",
      nome: "Fornecedores",
      principal: true,
      icon: IconFornecedores,
    },
    {
      label: "Entradas",
      nome: "Entradas",
      icon: IconEntradas,
    },
    {
      label: "Entregas",
      nome: "Entregas",
      icon: IconEntregas,
    },
    {
      label: "Devoluções",
      nome: "Devoluções",
      icon: IconDevolucoes,
    },
    {
      label: "Administração",
      nome: "Administracao",
      icon: IconAdmin,
    },
  ];

  const itensFuncionario = [
    {
      label: "Dashboard",
      nome: "Dashboard",
      principal: true,
      icon: IconDashboard,
    },
    {
      label: "Entregas",
      nome: "Entregas",
      principal: true,
      icon: IconEntregas,
    },
    {
      label: "Devoluções",
      nome: "Devoluções",
      principal: true,
      icon: IconDevolucoes,
    },
  ];

  const navItems = useMemo(() => {
    if (isSuperAdmin) return itensSuperAdmin;
    if (isAdminEmpresa) return itensAdminEmpresa;
    if (isFuncionario) return itensFuncionario;

    return itensFuncionario;
  }, [isSuperAdmin, isAdminEmpresa, isFuncionario]);

  const menuPrincipal = navItems.filter((item) => item.principal);
  const menuSecundario = navItems.filter((item) => !item.principal);
  const paginaNoMenuSecundario = menuSecundario.some(
    (item) => item.nome === paginaAtual
  );

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-xl">
      <div className="px-4 lg:px-6 py-3">
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center gap-6 xl:gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 xl:w-11 xl:h-11 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-sm">
              <svg className="w-5 h-5 xl:w-6 xl:h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="leading-tight">
              <h1 className="text-lg xl:text-xl font-bold tracking-tight">
                SGEPI
              </h1>
              <p className="hidden xl:block text-[10px] text-blue-300 uppercase tracking-[0.22em] font-semibold mt-0.5">
                {isSuperAdmin ? "Painel Master" : "Gestão de Estoque"}
              </p>
            </div>
          </div>

          <div className="flex justify-center min-w-0">
            <nav className="flex items-center gap-2.5 flex-wrap justify-center">
              {menuPrincipal.map((item) => (
                <Botao
                  key={item.nome}
                  label={item.label}
                  nomePagina={item.nome}
                  icone={item.icon}
                />
              ))}

              {menuSecundario.length > 0 && (
                <div className="relative" ref={menuMaisRef}>
                  <button
                    type="button"
                    onClick={() => setMenuMaisAberto((prev) => !prev)}
                    className={`
                      shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${
                        paginaNoMenuSecundario || menuMaisAberto
                          ? "bg-white text-blue-900 shadow-md"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <span>Mais</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        menuMaisAberto ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuMaisAberto && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[230px] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-2xl p-2">
                      <div className="flex flex-col gap-1">
                        {menuSecundario.map((item) => {
                          const ativo = paginaAtual === item.nome;

                          return (
                            <button
                              key={item.nome}
                              type="button"
                              onClick={() => {
                                setPagina(item.nome);
                                setMenuMaisAberto(false);
                              }}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition
                                ${
                                  ativo
                                    ? "bg-white text-blue-900"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                }
                              `}
                            >
                              <span className="shrink-0">{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <div className="hidden 2xl:flex flex-col items-end justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 min-w-[180px]">
              <span className="text-sm text-blue-100 whitespace-nowrap">
                Olá, <b>{nomeUsuario}</b>
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-blue-300 mt-0.5">
                {perfilNormalizado}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-200 border border-red-500/30 px-4 py-2.5 rounded-xl font-medium transition text-sm whitespace-nowrap"
            >
              <span>Sair</span>
            </button>
          </div>
        </div>

        <div className="flex lg:hidden items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-sm">
              <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">SGEPI</h1>
              <p className="text-[10px] text-blue-300 uppercase tracking-[0.22em] font-semibold mt-0.5">
                {isSuperAdmin ? "Painel Master" : "Gestão de Estoque"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuAberto((prev) => !prev)}
            className="ml-auto p-2.5 text-blue-100 hover:text-white border border-white/10 rounded-xl hover:bg-white/10 transition shrink-0"
          >
            {menuAberto ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuAberto && (
          <div className="lg:hidden mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-3 shadow-lg">
            <div className="px-2 pb-3 mb-3 border-b border-white/10">
              <p className="text-sm text-blue-100">
                Olá, <b>{nomeUsuario}</b>
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-blue-300 mt-1">
                Perfil: {perfilNormalizado}
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Botao
                  key={item.nome}
                  label={item.label}
                  nomePagina={item.nome}
                  icone={item.icon}
                  isMobile={true}
                />
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-200 hover:bg-red-600 hover:text-white transition"
              >
                <span>Sair do Sistema</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;