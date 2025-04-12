"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Users } from "lucide-react"
import { api } from '@/services/api'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface Customer {
  id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  source?: 'local' | 'asaas'; // Indica a origem do cliente
  order_count?: number; // Quantidade de compras do cliente
  created_at?: string; // Data de criação do cliente
}

export default function CustomersPage() {
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'local' | 'asaas'>('local');
  
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [asaasCustomers, setAsaasCustomers] = useState<Customer[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    cpf_cnpj: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    source: activeTab // Define a origem do cliente com base na aba ativa
  });
  
  // Estados para controlar erros de validação
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    cpf_cnpj: '',
    phone: '',
    postal_code: ''
  });
  
  // Estados para controlar visualização e edição de clientes
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [updatingCustomer, setUpdatingCustomer] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      console.log('Iniciando carregamento de clientes...');
      
      // Carregar apenas os clientes da aba ativa
      if (activeTab === 'asaas') {
        try {
          console.log('Buscando clientes do Asaas...');
          const asaasResponse = await api.get('/asaas/customers');
          console.log('Resposta do Asaas:', asaasResponse.data);
          const asaasData = asaasResponse.data.data || [];
          
          // Log completo dos dados do Asaas para debug
          console.log('Dados brutos de clientes Asaas:', JSON.stringify(asaasData, null, 2));
          
          setAsaasCustomers(asaasData.map((customer: any) => {
            // Log individual para verificar cada campo
            console.log(`Processando cliente Asaas ${customer.id}:`, {
              address: customer.address,
              city: customer.city,
              state: customer.state,
              postalCode: customer.postalCode
            });
            
            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              cpf_cnpj: customer.cpfCnpj || '',
              phone: customer.phone || '',
              address: customer.address || '',
              city: customer.city || '',
              state: customer.state || '',
              postal_code: customer.postalCode || '',
              created_at: customer.dateCreated || '',
              source: 'asaas'
            };
          }));
          console.log('Clientes do Asaas carregados:', asaasData.length);
        } catch (error: any) {
          console.error('Erro ao carregar clientes do Asaas:', error);
          toast.error('Erro ao carregar clientes do Asaas');
          setAsaasCustomers([]);
        }
      } else {
        // Carregar clientes locais do back-end
        try {
          console.log('Buscando clientes locais...');
          const localResponse = await api.get('/users');
          console.log('Resposta de clientes locais:', localResponse);
          const localData = localResponse.data || [];
          console.log('Dados de clientes locais:', localData);
          // Log completo dos dados para debug
          console.log('Dados brutos de clientes locais:', JSON.stringify(localData, null, 2));
          
          setLocalCustomers(localData.map((user: any) => {
            // Log individual para verificar cada campo
            console.log(`Processando usuário ${user.id}:`, {
              address: user.address,
              city: user.city,
              state: user.state,
              zip_code: user.zip_code
            });
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              cpf_cnpj: user.cpf || '',
              phone: user.phone || '',
              address: user.address || '',
              city: user.city || '',
              state: user.state || '',
              postal_code: user.zip_code || '',
              order_count: user.order_count || 0,
              created_at: user.created_at || '',
              source: 'local'
            };
          }));
          console.log('Clientes locais carregados:', localData.length);
        } catch (error: any) {
          console.error('Erro ao carregar clientes locais:', error);
          if (error.response) {
            console.error('Detalhes do erro:', error.response.status, error.response.data);
          }
          toast.error('Erro ao carregar clientes locais');
          setLocalCustomers([]);
        }
      }
    } catch (error) {
      console.error('Erro geral ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Atualiza a origem do novo cliente quando a aba muda
  useEffect(() => {
    setNewCustomer(prev => ({
      ...prev,
      source: activeTab
    }));
  }, [activeTab]);

  // Validar formulário de cliente
  const validateCustomerForm = () => {
    // Verificar se há erros no formulário
    const hasErrors = Object.values(formErrors).some(error => error !== '');
    if (hasErrors) {
      return ['Corrija os erros no formulário antes de continuar'];
    }
    
    const errors = [];
    
    // Verificar campos obrigatórios
    if (!newCustomer.name.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (!newCustomer.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      errors.push('Email inválido');
    }
    
    // Validar CPF/CNPJ se preenchido
    if (newCustomer.cpf_cnpj.trim()) {
      if (newCustomer.cpf_cnpj.length !== 11 && newCustomer.cpf_cnpj.length !== 14) {
        errors.push('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }
    }
    
    // Validar telefone se preenchido
    if (newCustomer.phone.trim() && (newCustomer.phone.length < 10 || newCustomer.phone.length > 11)) {
      errors.push('Telefone inválido. Deve conter 10 ou 11 dígitos');
    }
    
    // Validar CEP se preenchido
    if (newCustomer.postal_code.trim() && newCustomer.postal_code.length !== 8) {
      errors.push('CEP inválido. Deve conter 8 dígitos');
    }
    
    return errors;
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    const validationErrors = validateCustomerForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    setLoading(true);
    try {
      // Preparar os dados de acordo com o endpoint
      let customerData;
      let endpoint;
      
      if (activeTab === 'asaas') {
        // Dados para o Asaas
        endpoint = '/asaas/customers';
        customerData = {
          name: newCustomer.name,
          email: newCustomer.email,
          cpfCnpj: newCustomer.cpf_cnpj,
          phone: newCustomer.phone,
          address: newCustomer.address,
          city: newCustomer.city,
          state: newCustomer.state,
          postalCode: newCustomer.postal_code
        };
      } else {
        // Dados para o sistema local
        endpoint = '/users';
        customerData = {
          name: newCustomer.name,
          email: newCustomer.email,
          password: '123456', // Senha padrão que o usuário poderá alterar depois
          cpf: newCustomer.cpf_cnpj,
          phone: newCustomer.phone,
          address: newCustomer.address,
          city: newCustomer.city,
          state: newCustomer.state,
          zip_code: newCustomer.postal_code
        };
      }
      
      const response = await api.post(endpoint, customerData);
      console.log('Cliente criado com sucesso:', response.data);
      
      toast.success(`Cliente ${newCustomer.name} criado com sucesso!`, {
        duration: 4000,
        position: 'top-right',
      });
      
      setIsSheetOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        cpf_cnpj: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        source: activeTab
      });
      
      // Recarrega a lista de clientes após um pequeno delay para garantir que o backend processou
      setTimeout(() => {
        loadCustomers();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      
      // Mensagem de erro mais específica baseada na resposta do servidor
      if (error.response) {
        const errorMessage = error.response.data?.message || `Erro ao criar cliente (${error.response.status})`;
        toast.error(errorMessage, {
          duration: 5000,
        });
        
        // Tratar erros específicos
        if (error.response.status === 409) {
          toast.error('Já existe um cliente com este email ou CPF/CNPJ', {
            duration: 5000,
          });
        }
      } else {
        toast.error(`Erro ao criar cliente no sistema ${activeTab === 'asaas' ? 'Asaas' : 'local'}`, {
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar a data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };
  
  // Função para abrir modal de visualização de cliente
  const handleViewCustomer = (customer: Customer) => {
    setViewCustomer(customer);
    setIsViewModalOpen(true);
  };
  
  // Função para abrir modal de edição de cliente
  const handleEditCustomer = (customer: Customer) => {
    // Converter o cliente para o formato do formulário de edição
    setEditCustomer({
      ...customer,
      source: customer.source || activeTab as 'local' | 'asaas'
    });
    setIsEditSheetOpen(true);
  };
  
  // Função para atualizar um cliente
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    
    // Validar formulário antes de enviar
    const validationErrors = validateEditForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    setUpdatingCustomer(true);
    try {
      let endpoint;
      let customerData;
      
      if (editCustomer.source === 'asaas') {
        // Atualizar cliente no Asaas
        endpoint = `/asaas/customers/${editCustomer.id}`;
        customerData = {
          name: editCustomer.name,
          email: editCustomer.email,
          cpfCnpj: editCustomer.cpf_cnpj,
          phone: editCustomer.phone,
          address: editCustomer.address,
          city: editCustomer.city,
          state: editCustomer.state,
          postalCode: editCustomer.postal_code
        };
      } else {
        // Atualizar cliente local
        endpoint = `/users/${editCustomer.id}`;
        customerData = {
          name: editCustomer.name,
          email: editCustomer.email,
          cpf: editCustomer.cpf_cnpj,
          phone: editCustomer.phone,
          address: editCustomer.address,
          city: editCustomer.city,
          state: editCustomer.state,
          zip_code: editCustomer.postal_code
        };
      }
      
      const response = await api.put(endpoint, customerData);
      console.log('Cliente atualizado com sucesso:', response.data);
      
      toast.success(`Cliente ${editCustomer.name} atualizado com sucesso!`, {
        duration: 4000,
        position: 'top-right',
      });
      
      setIsEditSheetOpen(false);
      setEditCustomer(null);
      
      // Recarregar a lista de clientes
      setTimeout(() => {
        loadCustomers();
      }, 500);
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || `Erro ao atualizar cliente (${error.response.status})`;
        toast.error(errorMessage, {
          duration: 5000,
        });
      } else {
        toast.error(`Erro ao atualizar cliente no sistema ${editCustomer.source === 'asaas' ? 'Asaas' : 'local'}`, {
          duration: 5000,
        });
      }
    } finally {
      setUpdatingCustomer(false);
    }
  };
  
  // Validar formulário de edição
  const validateEditForm = () => {
    if (!editCustomer) return [];
    
    const errors = [];
    
    if (!editCustomer.name.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (!editCustomer.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editCustomer.email)) {
      errors.push('Email inválido');
    }
    
    return errors;
  };

  // Obter os clientes com base na aba ativa
  const displayCustomers = activeTab === 'local' ? localCustomers : asaasCustomers;

  // Estilo para as abas
  const tabStyle = (isActive: boolean) => {
    return cn(
      "flex items-center gap-2 transition-all",
      {
        "bg-white text-[#236F5D] border-t-2 border-x-2 border-[#236F5D] shadow-sm -mb-px": isActive,
        "bg-transparent text-gray-600 hover:text-[#236F5D] hover:bg-white/80": !isActive,
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#236F5D]">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os clientes do sistema e do Asaas em um só lugar.
          </p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 bg-[#236F5D] hover:bg-[#236F5D]/90 text-white font-medium px-4 py-2 rounded-lg shadow-sm">
              <Plus className="h-5 w-5" />
              Novo Cliente
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Criar {activeTab === 'local' ? 'Cliente no Sistema' : 'Cliente no Asaas'}</SheetTitle>
              <SheetDescription>
                Preencha os dados do cliente para criar um novo registro.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCustomer({ ...newCustomer, name: value });
                    
                    // Validar nome
                    if (!value.trim()) {
                      setFormErrors({...formErrors, name: 'Nome é obrigatório'});
                    } else {
                      setFormErrors({...formErrors, name: ''});
                    }
                  }}
                  required
                  className={formErrors.name ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCustomer({ ...newCustomer, email: value });
                    
                    // Validar email
                    if (!value.trim()) {
                      setFormErrors({...formErrors, email: 'Email é obrigatório'});
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      setFormErrors({...formErrors, email: 'Email inválido'});
                    } else {
                      setFormErrors({...formErrors, email: ''});
                    }
                  }}
                  required
                  className={formErrors.email ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={newCustomer.cpf_cnpj}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    // Limitar a 14 dígitos (CNPJ)
                    const formattedValue = value.slice(0, 14);
                    setNewCustomer({ ...newCustomer, cpf_cnpj: formattedValue });
                    
                    // Validar CPF/CNPJ
                    if (formattedValue && (formattedValue.length !== 11 && formattedValue.length !== 14)) {
                      setFormErrors({...formErrors, cpf_cnpj: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'});
                    } else {
                      setFormErrors({...formErrors, cpf_cnpj: ''});
                    }
                  }}
                  className={formErrors.cpf_cnpj ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.cpf_cnpj && <p className="text-red-500 text-xs mt-1">{formErrors.cpf_cnpj}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    // Limitar a 11 dígitos (celular com DDD)
                    const formattedValue = value.slice(0, 11);
                    setNewCustomer({ ...newCustomer, phone: formattedValue });
                    
                    // Validar telefone
                    if (formattedValue && (formattedValue.length < 10 || formattedValue.length > 11)) {
                      setFormErrors({...formErrors, phone: 'Telefone deve ter 10 ou 11 dígitos'});
                    } else {
                      setFormErrors({...formErrors, phone: ''});
                    }
                  }}
                  placeholder="DDD + número"
                  className={formErrors.phone ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">CEP</Label>
                <Input
                  id="postal_code"
                  value={newCustomer.postal_code}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    // Limitar a 8 dígitos (CEP brasileiro)
                    const formattedValue = value.slice(0, 8);
                    setNewCustomer({ ...newCustomer, postal_code: formattedValue });
                    
                    // Validar CEP
                    if (formattedValue && formattedValue.length !== 8) {
                      setFormErrors({...formErrors, postal_code: 'CEP deve ter 8 dígitos'});
                    } else {
                      setFormErrors({...formErrors, postal_code: ''});
                    }
                  }}
                  placeholder="Somente números"
                  className={formErrors.postal_code ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.postal_code && <p className="text-red-500 text-xs mt-1">{formErrors.postal_code}</p>}
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={loading || Object.values(formErrors).some(error => error !== '')}
                  className="bg-[#236F5D] hover:bg-[#236F5D]/90 text-white font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Criando...
                    </div>
                  ) : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-xl overflow-hidden bg-white shadow-md">
        <div className="bg-gradient-to-r from-[#236F5D]/10 to-[#236F5D]/5 px-4 py-3">
          <div className="flex space-x-1">
            <button 
              className={`${tabStyle(activeTab === 'local')} rounded-t-lg px-6 py-3 font-medium transition-all`}
              onClick={() => {
                setActiveTab('local');
                loadCustomers();
              }}
            >
              <Users className="w-5 h-5 mr-2 text-[#236F5D]" />
              Clientes do Sistema
            </button>
            <button 
              className={`${tabStyle(activeTab === 'asaas')} rounded-t-lg px-6 py-3 font-medium transition-all`}
              onClick={() => {
                setActiveTab('asaas');
                loadCustomers();
              }}
            >
              <svg className="w-5 h-5 mr-2 text-[#236F5D]" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Clientes Asaas
            </button>
          </div>
        </div>

        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-[#236F5D] focus:border-[#236F5D] focus:outline-none" 
              placeholder="Buscar cliente..." 
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-semibold text-[#236F5D]">Nome</TableHead>
              <TableHead className="font-semibold text-[#236F5D]">Email</TableHead>
              <TableHead className="font-semibold text-[#236F5D]">CPF/CNPJ</TableHead>
              <TableHead className="font-semibold text-[#236F5D]">Telefone</TableHead>
              <TableHead className="font-semibold text-[#236F5D]">Compras</TableHead>
              <TableHead className="font-semibold text-[#236F5D]">Data de Cadastro</TableHead>
              <TableHead className="text-right font-semibold text-[#236F5D]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCustomers ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-10 w-10 text-[#236F5D] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-500 text-lg">Carregando clientes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center bg-gray-50 py-8 px-4 rounded-lg">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Users className="h-12 w-12 text-[#236F5D]/70" />
                    </div>
                    <span className="text-gray-600 text-lg mb-2">Nenhum cliente encontrado</span>
                    <p className="text-gray-500 mb-4 max-w-md text-center">
                      Você ainda não possui clientes cadastrados nesta categoria.
                    </p>
                    <Button 
                      className="mt-2 bg-[#236F5D] hover:bg-[#236F5D]/90 text-white" 
                      onClick={() => setIsSheetOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar cliente
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50 border-b">
                  <TableCell className="font-medium text-gray-900">{customer.name}</TableCell>
                  <TableCell className="text-gray-700">{customer.email}</TableCell>
                  <TableCell className="text-gray-700 font-mono text-sm">{customer.cpf_cnpj || '-'}</TableCell>
                  <TableCell className="text-gray-700">{customer.phone || '-'}</TableCell>
                  <TableCell>
                    {customer.order_count !== undefined ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#236F5D]/10 text-[#236F5D] border border-[#236F5D]/20">
                        {customer.order_count}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-gray-700">{formatDate(customer.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <span className="sr-only">Ver detalhes</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-[#236F5D] hover:text-[#236F5D]/80 hover:bg-[#236F5D]/10"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <span className="sr-only">Editar</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Modal de Visualização de Cliente */}
      {isViewModalOpen && viewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#236F5D]">Detalhes do Cliente</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setIsViewModalOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[#236F5D]">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium text-gray-900">{viewCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{viewCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CPF/CNPJ</p>
                      <p className="font-medium text-gray-900 font-mono">{viewCustomer.cpf_cnpj || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium text-gray-900">{viewCustomer.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data de Cadastro</p>
                      <p className="font-medium text-gray-900">{formatDate(viewCustomer.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-[#236F5D]">Endereço</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Endereço</p>
                      <p className="font-medium text-gray-900">{viewCustomer.address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cidade</p>
                      <p className="font-medium text-gray-900">{viewCustomer.city || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium text-gray-900">{viewCustomer.state || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CEP</p>
                      <p className="font-medium text-gray-900 font-mono">{viewCustomer.postal_code || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Origem</p>
                    <div className="mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {viewCustomer.source === 'asaas' ? 'Asaas' : 'Sistema Local'}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Total de Compras</p>
                    <div className="mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#236F5D]/10 text-[#236F5D] border border-[#236F5D]/20">
                      {viewCustomer.order_count || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Fechar
                </Button>
                <Button 
                  className="bg-[#236F5D] hover:bg-[#236F5D]/90 text-white"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditCustomer(viewCustomer);
                  }}
                >
                  Editar Cliente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sheet de Edição de Cliente */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar Cliente</SheetTitle>
            <SheetDescription>
              Atualize as informações do cliente.
            </SheetDescription>
          </SheetHeader>
          
          {editCustomer && (
            <form onSubmit={handleUpdateCustomer} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editCustomer.name}
                  onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editCustomer.email}
                  onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-cpf-cnpj">CPF/CNPJ</Label>
                <Input
                  id="edit-cpf-cnpj"
                  value={editCustomer.cpf_cnpj || ''}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    // Limitar a 14 dígitos (CNPJ)
                    const formattedValue = value.slice(0, 14);
                    setEditCustomer({ ...editCustomer, cpf_cnpj: formattedValue });
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editCustomer.phone || ''}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    // Limitar a 11 dígitos (celular com DDD)
                    const formattedValue = value.slice(0, 11);
                    setEditCustomer({ ...editCustomer, phone: formattedValue });
                  }}
                  placeholder="DDD + número"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereço</Label>
                <Input
                  id="edit-address"
                  value={editCustomer.address || ''}
                  onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={editCustomer.city || ''}
                    onChange={(e) => setEditCustomer({ ...editCustomer, city: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input
                    id="edit-state"
                    value={editCustomer.state || ''}
                    onChange={(e) => setEditCustomer({ ...editCustomer, state: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-postal-code">CEP</Label>
                <Input
                  id="edit-postal-code"
                  value={editCustomer.postal_code || ''}
                  onChange={(e) => {
                    // Permitir apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    // Limitar a 8 dígitos (CEP brasileiro)
                    const formattedValue = value.slice(0, 8);
                    setEditCustomer({ ...editCustomer, postal_code: formattedValue });
                  }}
                  placeholder="Somente números"
                />
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditSheetOpen(false)}
                >
                  Cancelar
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={updatingCustomer}
                  className="bg-[#236F5D] hover:bg-[#236F5D]/90 text-white font-medium"
                >
                  {updatingCustomer ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </div>
                  ) : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
