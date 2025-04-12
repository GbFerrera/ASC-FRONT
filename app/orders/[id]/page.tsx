"use client"

import { useState, useEffect } from 'react'
import { getOrderDetails, updateOrderStatus, updatePaymentStatus, updateOrderItemStatus, Order, OrderStatus, PaymentStatus } from '@/services/orders'
import Link from 'next/link'
import { toast } from 'sonner'

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)
  const [openItemDropdown, setOpenItemDropdown] = useState<number | null>(null)
  
  // Buscar detalhes do pedido
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const data = await getOrderDetails(parseInt(params.id))
        setOrder(data) // data agora pode ser Order | null
        setError(null)
      } catch (err) {
        console.error(`Erro ao buscar detalhes do pedido ${params.id}:`, err)
        setError('Falha ao carregar detalhes do pedido. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [params.id])
  
  // Atualizar status do pedido
  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!order) return
    
    try {
      setUpdatingStatus(true)
      const updatedOrder = await updateOrderStatus(order.id, status)
      
      if (updatedOrder) {
        setOrder(updatedOrder)
        toast.success(`Status do pedido #${order.id} atualizado para ${translateStatus(status)}`)
      } else {
        // Se não receber o pedido atualizado, recarregar os dados
        const refreshedOrder = await getOrderDetails(order.id)
        if (refreshedOrder) {
          setOrder(refreshedOrder)
          toast.success(`Status do pedido atualizado com sucesso`)
        } else {
          toast.error('Não foi possível atualizar os dados do pedido')
        }
      }
    } catch (err) {
      console.error(`Erro ao atualizar status do pedido ${order.id}:`, err)
      toast.error('Falha ao atualizar status do pedido. Tente novamente.')
    } finally {
      setUpdatingStatus(false)
    }
  }
  
  // Atualizar status de pagamento
  const handleUpdatePaymentStatus = async (status: PaymentStatus) => {
    if (!order) return
    
    try {
      setUpdatingStatus(true)
      const updatedOrder = await updatePaymentStatus(order.id, status)
      
      if (updatedOrder) {
        setOrder(updatedOrder)
        toast.success(`Status de pagamento do pedido #${order.id} atualizado para ${translatePaymentStatus(status)}`)
      } else {
        // Se não receber o pedido atualizado, recarregar os dados
        const refreshedOrder = await getOrderDetails(order.id)
        if (refreshedOrder) {
          setOrder(refreshedOrder)
          toast.success(`Status de pagamento atualizado com sucesso`)
        } else {
          toast.error('Não foi possível atualizar os dados do pedido')
        }
      }
    } catch (err) {
      console.error(`Erro ao atualizar status de pagamento do pedido ${order.id}:`, err)
      toast.error('Falha ao atualizar status de pagamento. Tente novamente.')
    } finally {
      setUpdatingStatus(false)
    }
  }
  
  // Atualizar status de um item do pedido
  const handleUpdateItemStatus = async (itemId: number, status: OrderStatus) => {
    if (!order) return
    
    try {
      setUpdatingItemId(itemId)
      setOpenItemDropdown(null) // Fechar dropdown ao iniciar a atualização
      const updatedOrder = await updateOrderItemStatus(order.id, itemId, status)
      
      if (updatedOrder) {
        setOrder(updatedOrder)
        toast.success(`Status do item atualizado para ${translateStatus(status)}`, {
          id: `update-item-${itemId}`,
          duration: 4000,
        })
      } else {
        // Se não receber o pedido atualizado, recarregar os dados
        const refreshedOrder = await getOrderDetails(order.id)
        if (refreshedOrder) {
          setOrder(refreshedOrder)
          toast.success(`Status do item atualizado com sucesso`, {
            id: `update-item-${itemId}`,
            duration: 4000,
          })
        } else {
          toast.error('Não foi possível atualizar os dados do pedido', {
            id: `update-item-error-${itemId}`,
            duration: 5000,
          })
        }
      }
    } catch (err) {
      console.error(`Erro ao atualizar status do item ${itemId} do pedido ${order.id}:`, err)
      toast.error('Falha ao atualizar status do item. Tente novamente.', {
        id: `update-item-error-${itemId}`,
        duration: 5000,
      })
    } finally {
      setUpdatingItemId(null)
    }
  }
  
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
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#236F5D] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg">Carregando detalhes do pedido...</span>
          </div>
        </div>
      </div>          
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
          <div className="mt-4">
            <Link href="/orders" className="text-[#236F5D] hover:underline">
              &larr; Voltar para a lista de pedidos
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            Pedido não encontrado
          </div>
          <div className="mt-4">
            <Link href="/orders" className="text-[#236F5D] hover:underline">
              &larr; Voltar para a lista de pedidos
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link href="/orders" className="text-[#236F5D] hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Voltar para a lista de pedidos
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
              <p className="text-gray-600">Criado em {formatDate(order.created_at)}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <button 
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Marcar como Concluído
                </button>
              )}
              
              {order.status !== 'cancelled' && (
                <button 
                  onClick={() => handleUpdateStatus('cancelled')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar Pedido
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Informações do Pedido</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status as OrderStatus)}`}>
                    {translateStatus(order.status as OrderStatus)}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Pagamento</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.payment_status as PaymentStatus)}`}>
                    {translatePaymentStatus(order.payment_status as PaymentStatus)}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Método de Pagamento</p>
                  <p className="font-medium">{order.payment_method || 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Código de Rastreio</p>
                  <p className="font-medium">{order.tracking_code || 'Não disponível'}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Observações</p>
                  <p className="font-medium">{order.notes || 'Nenhuma observação'}</p>
                </div>
              </div>
              
              {order.payment_status !== 'paid' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium mb-2">Atualizar Status de Pagamento:</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdatePaymentStatus('paid')}
                      disabled={updatingStatus}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Marcar como Pago
                    </button>
                    
                    {order.payment_status !== 'failed' && (
                      <button 
                        onClick={() => handleUpdatePaymentStatus('failed')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Marcar como Falha
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Informações do Cliente</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{order.user?.name || `Usuário ID: ${order.user_id}`}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.user?.email || 'Não disponível'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{order.user?.phone || 'Não disponível'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Itens do Pedido</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.certificate_name}</div>
                      <div className="text-sm text-gray-500">ID: {item.certificate_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between" role="group" aria-label="Status do item e opções de atualização">
                        <div className="flex items-center">
                          <span 
                            className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusClass(item.status as OrderStatus)}`}
                            role="status"
                            aria-label={`Status atual: ${translateStatus(item.status as OrderStatus)}`}
                          >
                            {translateStatus(item.status as OrderStatus)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">

                          
                          {/* Botão de ação com menu de status */}
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenItemDropdown(openItemDropdown === item.id ? null : item.id)}
                              disabled={updatingItemId === item.id}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#236F5D] bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#236F5D] focus:ring-offset-2"
                              aria-haspopup="true"
                              aria-expanded={openItemDropdown === item.id}
                              aria-label="Alterar status do item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Alterar Status
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {openItemDropdown === item.id && (
                              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200 overflow-hidden" role="menu">
                                <div className="py-1">
                                  {item.status !== 'pending' && (
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, 'pending')}
                                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
                                      role="menuitem"
                                    >
                                      <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
                                      Pendente
                                    </button>
                                  )}
                                  
                                  {item.status !== 'processing' && (
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, 'processing')}
                                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                      role="menuitem"
                                    >
                                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                                      Em Processamento
                                    </button>
                                  )}
                                  
                                  {item.status !== 'completed' && (
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, 'completed')}
                                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                                      role="menuitem"
                                    >
                                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                                      Concluído
                                    </button>
                                  )}
                                  
                                  {item.status !== 'cancelled' && (
                                    <button
                                      onClick={() => handleUpdateItemStatus(item.id, 'cancelled')}
                                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
                                      role="menuitem"
                                    >
                                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                                      Cancelado
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Overlay para fechar o menu ao clicar fora */}
                            {openItemDropdown === item.id && (
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenItemDropdown(null)}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          
                          {/* Indicador de carregamento */}
                          {updatingItemId === item.id && (
                            <div className="flex items-center justify-center" role="status" aria-live="polite">
                              <svg className="animate-spin h-5 w-5 text-[#236F5D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="sr-only">Atualizando status...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhum item encontrado para este pedido
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">Total:</td>
                  <td className="px-6 py-4 font-bold text-[#236F5D]">{formatCurrency(order.total_amount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
