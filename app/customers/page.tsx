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
import { Plus } from "lucide-react"
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

interface Customer {
  id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  phone: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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
    postal_code: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get('/asaas/customers');
      setCustomers(response.data.data || []); // ASAAS retorna os dados dentro de data.data
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/asaas/customers', newCustomer);
      toast.success('Cliente criado com sucesso!');
      setIsSheetOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        cpf_cnpj: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: ''
      });
      loadCustomers(); // Recarrega a lista de clientes
    } catch (error) {
      toast.error('Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Novo Cliente</SheetTitle>
              <SheetDescription>
                Adicione um novo cliente ao sistema.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={newCustomer.cpf_cnpj}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                  placeholder="CPF ou CNPJ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Estado"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">CEP</Label>
                <Input
                  id="postal_code"
                  value={newCustomer.postal_code}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSheetOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingCustomers ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Nenhum cliente encontrado</TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.cpf_cnpj}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
