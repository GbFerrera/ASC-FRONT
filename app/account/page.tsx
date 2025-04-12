"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/services/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff, FileText, ChevronRight, LogOut } from "lucide-react";
import Link from 'next/link';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, signIn, signUp, signOut, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'orders' | 'profile' | 'payment'>('orders');
  
  // Estados para formulu00e1rios
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Estado para pedidos
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    // Se o usuu00e1rio estiver autenticado, buscar seus pedidos
    if (isAuthenticated && user) {
      fetchUserOrders();
    }
  }, [isAuthenticated, user]);

  async function fetchUserOrders() {
    if (!user) return;
    
    try {
      setOrdersLoading(true);
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Nu00e3o foi possu00edvel carregar seus pedidos. Tente novamente.');
    } finally {
      setOrdersLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error('Preencha todos os campos obrigatu00f3rios');
      return;
    }
    
    try {
      await signUp({
        name,
        email,
        password,
        cpf,
        phone,
        address,
        city,
        state,
        zip_code: zipCode
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    }
  };

  // Renderização condicional baseada no estado de autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Se o usuário estiver autenticado, mostrar a página da conta
  if (isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar de navegação */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 rounded-full p-2">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <nav>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={`flex items-center gap-2 w-full text-left p-2 rounded-md mb-2 ${activeSection === 'orders' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Meus Pedidos</span>
                </button>
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`flex items-center gap-2 w-full text-left p-2 rounded-md mb-2 ${activeSection === 'profile' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}
                >
                  <User className="h-4 w-4" />
                  <span>Meu Perfil</span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full text-left p-2 rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="w-full md:w-3/4">
            {activeSection === 'orders' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Meus Pedidos</h2>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Pedido #{order.id}</p>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status === 'completed' ? 'Concluído' : order.status === 'cancelled' ? 'Cancelado' : 'Em andamento'}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">Certificado: {order.certificate?.name || 'Não especificado'}</p>
                          <p className="text-sm">Valor: R$ {order.total_price?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Link href={`/orders/${order.id}`} className="flex items-center text-sm text-green-600 hover:text-green-800">
                            Ver detalhes <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Você ainda não tem pedidos.</p>
                    <Link href="/certificates" className="mt-4 inline-block text-green-600 hover:text-green-800">
                      Explorar certificados disponíveis
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Meu Perfil</h2>
                {/* Formulário de perfil aqui */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar formulários de login/registro
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Entre com sua conta para acessar seus pedidos e certificados.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="seu@email.com" 
                          className="pl-10" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          className="pl-10" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-6">Entrar</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>Registre-se para acompanhar seus pedidos.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="register-name" 
                          placeholder="Seu nome completo" 
                          className="pl-10" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="register-email" 
                          type="email" 
                          placeholder="seu@email.com" 
                          className="pl-10" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="register-password" 
                          type={showPassword ? "text" : "password"} 
                          className="pl-10" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-6">Criar Conta</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
