import axios, { AxiosError, AxiosInstance } from "axios";

// Obtendo a URL da API a partir das variáveis de ambiente
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("Aviso: NEXT_PUBLIC_API_URL não está definido. Usando fallback para localhost.");
}

// Criando a instância do Axios com configurações otimizadas
export const api: AxiosInstance = axios.create({
  baseURL: API_URL || "http://localhost:3333",
  timeout: 15000, // 15 segundos de timeout para requisições
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Obter token de autenticação do localStorage (se existir)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('atlas:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Tratamento de erros comuns
    if (error.response) {
      // Erro do servidor (status code não 2xx)
      const status = error.response.status;
      
      // Tratamento de erro de autenticação (401)
      if (status === 401) {
        // Se estiver no navegador, limpar credenciais e redirecionar para login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('atlas:token');
          localStorage.removeItem('atlas:user');
          
          // Redirecionar para login se não estiver já na página de login
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Erro de permissão (403)
      if (status === 403) {
        console.error('Erro de permissão: Acesso negado');
      }
      
      // Erro de servidor (500)
      if (status >= 500) {
        console.error('Erro de servidor:', error.response.data);
      }
    } else if (error.request) {
      // Requisição feita mas sem resposta (problemas de rede)
      console.error('Erro de rede: Sem resposta do servidor');
    } else {
      // Erro ao configurar a requisição
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);