"use client"

import { useState, useEffect, useRef } from 'react'
import { getAllOrders, updateOrderStatus, updatePaymentStatus, Order, OrderStatus, PaymentStatus } from '@/services/orders'
import Link from "next/link"
import { toast } from 'sonner'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  
  // Buscar todos os pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await getAllOrders()
        // Garantir que data seja sempre um array
        setOrders(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err)
        setError('Falha ao carregar pedidos. Tente novamente mais tarde.')
        setOrders([]) // Inicializar como array vazio em caso de erro
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
    
      return () => {};
  }, [])
  
  // Atualizar status do pedido
  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const updatedOrder = await updateOrderStatus(orderId, status)
      
      // Atualizar o pedido na lista
      if (updatedOrder) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: updatedOrder.status } : order
          )
        )
      } else {
        // Se não receber o pedido atualizado, recarregar todos os pedidos
        const refreshedOrders = await getAllOrders()
        setOrders(Array.isArray(refreshedOrders) ? refreshedOrders : [])
      }
      
      toast.success(`Status do pedido #${orderId} atualizado para ${translateStatus(status)}`)
    } catch (err) {
      console.error(`Erro ao atualizar status do pedido ${orderId}:`, err)
      toast.error('Falha ao atualizar status do pedido. Tente novamente.')
    } finally {
      setUpdatingOrderId(null)
    }
  }
  
  // Atualizar status de pagamento
  const handleUpdatePaymentStatus = async (orderId: number, status: PaymentStatus) => {
    try {
      setUpdatingOrderId(orderId)
      const updatedOrder = await updatePaymentStatus(orderId, status)
      
      // Atualizar o pedido na lista
      if (updatedOrder) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, payment_status: updatedOrder.payment_status } : order
          )
        )
      } else {
        // Se não receber o pedido atualizado, recarregar todos os pedidos
        const refreshedOrders = await getAllOrders()
        setOrders(Array.isArray(refreshedOrders) ? refreshedOrders : [])
      }
      
      toast.success(`Status de pagamento do pedido #${orderId} atualizado para ${translatePaymentStatus(status)}`)
    } catch (err) {
      console.error(`Erro ao atualizar status de pagamento do pedido ${orderId}:`, err)
      toast.error('Falha ao atualizar status de pagamento. Tente novamente.')
    } finally {
      setUpdatingOrderId(null)
    }
  }
  
  // Filtrar pedidos com base nos filtros aplicados
  const filteredOrders = orders.filter(order => {
    // Filtro de busca (ID do pedido ou nome do cliente)
    const searchMatch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) || 
      (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro de status
    const statusMatch = statusFilter === 'all' || order.status === statusFilter
    
    // Filtro de pagamento
    const paymentMatch = paymentFilter === 'all' || order.payment_status === paymentFilter
    
    return searchMatch && statusMatch && paymentMatch
  })
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
  }
  
  // Formatar valor para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Obter classe CSS para o status do pedido
  const getStatusClass = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Obter classe CSS para o status de pagamento
  const getPaymentStatusClass = (status: PaymentStatus) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Traduzir status para português
  const translateStatus = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'Pendente'
      case 'processing': return 'Em Processamento'
      case 'completed': return 'Concluído'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  // Traduzir status de pagamento para português
  const translatePaymentStatus = (status: PaymentStatus) => {
    switch(status) {
      case 'pending': return 'Pendente'
      case 'paid': return 'Pago'
      case 'failed': return 'Falhou'
      default: return status
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">Gerenciamento de Pedidos</h1>
        <p className="text-gray-600 mb-6">Visualize e gerencie todos os pedidos do sistema</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por ID ou cliente..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#236F5D]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#236F5D]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Em Processamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <select 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#236F5D]"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">Todos os Pagamentos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="failed">Falhou</option>
            </select>
            
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#236F5D] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg">Carregando pedidos...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <caption className="text-sm text-gray-500 mb-2">Lista de pedidos - Total: {filteredOrders.length}</caption>
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.user?.name || `Usuário ${order.user_id}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(order.total_amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status as OrderStatus)}`}>
                          {translateStatus(order.status as OrderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.payment_status as PaymentStatus)}`}>
                          {translatePaymentStatus(order.payment_status as PaymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center">
                          {/* Link para visualizar detalhes */}
                          <Link href={`/orders/${order.id}`} className="text-[#236F5D] hover:text-[#1a5346] inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nenhum pedido encontrado com os filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}