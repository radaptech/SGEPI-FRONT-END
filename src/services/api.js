import { toast } from "react-toastify";
const DEFAULT_BASE_URL = "https://homolog.radaptech.com.br/api";

// 1. BLINDAGEM DA URL: Garante que sempre tenha https:// e evita URLs relativas
let envUrl = process.env.REACT_APP_API_URL || DEFAULT_BASE_URL;

if (envUrl && !envUrl.startsWith('http')) {
    envUrl = `https://${envUrl}`;
}

export const BASE_URL = envUrl.replace(/\/+$/, "");

console.log("BASE_URL configurada para:", BASE_URL);

function normalizarRota(rota = "") {
    if (!rota) return "";
    return rota.startsWith("/") ? rota : `/${rota}`;
}

function getToken() {
    return sessionStorage.getItem("token");
}

function getTenantId() {
    const hostname = window.location.hostname;
    const partes = hostname.split(".");
    return partes[0]; 
}

function isFormData(valor) {
    return typeof FormData !== "undefined" && valor instanceof FormData;
}

function montarHeaders(headersExtras = {}, body = null) {
    const token = getToken();

    const tenantId = getTenantId();
    const headers = { ...headersExtras };

    if (!isFormData(body) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
        headers["X-tenant-ID"] = tenantId;
    }

    return headers;
}

function extrairMensagemErro(dados, fallback) {
    if (!dados) return fallback;
    if (typeof dados === "string") return dados || fallback;

    if (typeof dados === "object") {
        const erroPrincipal = dados.error || dados.erro || dados.message || dados.mensagem || fallback;
        const detalhes = dados.detalhes || dados.detail || dados.details;
        return detalhes ? `${erroPrincipal} - Detalhes: ${detalhes}` : erroPrincipal;
    }

    return fallback;
}

async function lerCorpoResposta(resposta) {
    if (resposta.status === 204) return null;
    const contentType = resposta.headers.get("content-type") || "";

    // 1. Se for JSON
    if (contentType.includes("application/json")) {
        try { return await resposta.json(); } catch { return null; }
    }
    
    // 2. 👇 A BLINDAGEM DO PDF E BINÁRIOS 👇
    if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) {
        try { return await resposta.blob(); } catch { return null; }
    }

    // 3. O fallback para texto (HTML, erros em texto plano, etc)
    try { return await resposta.text(); } catch { return null; }
}

async function tratarResposta(resposta, rota, mensagemErroPadrao) {
    const dados = await lerCorpoResposta(resposta);
    
    if (!resposta.ok) {
        
        // ==========================================
        if (resposta.status === 401) {
            console.warn("Token expirado ou inválido.");
            sessionStorage.removeItem("token"); // Limpa o token estragado
            
            // Só redireciona se a URL atual NÃO for a de login 
            // E se a rota da API que deu erro NÃO for a tentativa de "/login"
            if (window.location.pathname !== "/login" && !rota.includes("/login")) {
                toast.error("Sua sessão expirou. Por favor, faça login novamente.");
                window.location.href = "/login"; 
            }
        }
        // ==========================================

        const fallback = `${mensagemErroPadrao} ${rota}`;
        const mensagemFinal = extrairMensagemErro(dados, fallback);
        
        // Dispara o erro globalmente 
        // (Isso vai mostrar o erro de "Senha incorreta" quando a rota for /login)
        toast.error(mensagemFinal);
        
        throw new Error(mensagemFinal);
    }
    
    return dados;
}

async function request(method, rota, dados = null, headersExtras = {}) {
    const rotaNormalizada = normalizarRota(rota);
    const url = `${BASE_URL}${rotaNormalizada}`;

    const opcoes = {
        method,
        headers: montarHeaders(headersExtras, dados),
    };

    if (dados !== null && dados !== undefined) {
        opcoes.body = isFormData(dados) ? dados : JSON.stringify(dados);
    }

    console.log(`[Requisição API] Disparando ${method} para: ${url}`);

    const resposta = await fetch(url, opcoes);
    return await tratarResposta(resposta, rotaNormalizada, `Erro ao processar a requisição em`);
}

export const api = {
    get: (rota, h) => request("GET", rota, null, h),
    post: (rota, d, h) => request("POST", rota, d, h),
    put: (rota, d, h) => request("PUT", rota, d, h),
    patch: (rota, d, h) => request("PATCH", rota, d, h),
    delete: (rota, h) => request("DELETE", rota, null, h),
};

export { getToken };