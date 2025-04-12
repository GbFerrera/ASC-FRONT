"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type User = {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
};

type SignUpData = {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há um token no localStorage
    const token = localStorage.getItem('@atlas:token');
    const storedUser = localStorage.getItem('@atlas:user');

    if (token && storedUser) {
      // Configurar o token no cabeçalho das requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      
      // Simulação de autenticação - em produção, isso seria uma chamada real à API
      // const response = await api.post('/sessions', { email, password });
      
      // Simulando uma resposta bem-sucedida para desenvolvimento
      const response = {
        data: {
          user: {
            id: 1,
            name: 'Usuário Teste',
            email: email,
            cpf: '123.456.789-00',
            phone: '(11) 98765-4321'
          },
          token: 'fake-jwt-token'
        }
      };

      const { user: userData, token } = response.data;

      // Salvar o token e os dados do usuário no localStorage
      localStorage.setItem('@atlas:token', token);
      localStorage.setItem('@atlas:user', JSON.stringify(userData));

      // Configurar o token no cabeçalho das requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      console.error('Erro ao fazer login:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(userData: SignUpData) {
    try {
      setIsLoading(true);
      
      // Simulação de registro - em produção, isso seria uma chamada real à API
      // const response = await api.post('/users', userData);
      
      // Simulando uma resposta bem-sucedida para desenvolvimento
      const newUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zip_code: userData.zip_code
      };

      const token = 'fake-jwt-token';

      // Salvar o token e os dados do usuário no localStorage
      localStorage.setItem('@atlas:token', token);
      localStorage.setItem('@atlas:user', JSON.stringify(newUser));

      // Configurar o token no cabeçalho das requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(newUser);
      toast.success('Cadastro realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
      console.error('Erro ao criar conta:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function signOut() {
    // Remover o token e os dados do usuário do localStorage
    localStorage.removeItem('@atlas:token');
    localStorage.removeItem('@atlas:user');

    // Remover o token do cabeçalho das requisições
    delete api.defaults.headers.common['Authorization'];

    setUser(null);
    router.push('/');
  }

  async function updateUser(userData: Partial<User>) {
    try {
      setIsLoading(true);
      
      // Simulação de atualização - em produção, isso seria uma chamada real à API
      // const response = await api.put(`/users/${user?.id}`, userData);
      
      // Atualizar os dados do usuário no estado e no localStorage
      const updatedUser = { ...user, ...userData } as User;
      localStorage.setItem('@atlas:user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar dados. Tente novamente.');
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
