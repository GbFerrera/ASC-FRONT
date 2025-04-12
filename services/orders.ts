import { api } from './api';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type OrderItem = {
  id: number;
  certificate_id: number;
  certificate_name: string;
  price: number;
  quantity: number;
  status: string;
  certificate_data: any;
};

export type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_id?: string;
  tracking_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
};

export type OrderCreateData = {
  user_id: number;
  certificate_items: { 
    certificate_id: number; 
    quantity: number; 
    price?: number;
    certificate_data?: any 
  }[];
  notes?: string;
};

// Obter todos os pedidos (para administradores)
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await api.get('/orders');
    // Garantir que sempre retorne um array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    // Retornar array vazio em caso de erro
    return [];
  }
}

// Obter pedidos de um usuário específico
export async function getUserOrders(userId: number): Promise<Order[]> {
  try {
    const response = await api.get(`/orders/user/${userId}`);
    // Garantir que sempre retorne um array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Erro ao buscar pedidos do usuário ${userId}:`, error);
    // Retornar array vazio em caso de erro
    return [];
  }
}

// Obter detalhes de um pedido específico
export async function getOrderDetails(orderId: number): Promise<Order | null> {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data || null;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do pedido ${orderId}:`, error);
    return null;
  }
}

// Criar um novo pedido
export async function createOrder(orderData: OrderCreateData): Promise<Order> {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

// Atualizar status de um pedido
export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<any> {
  try {
    const response = await api.put(`/orders/${orderId}`, { status });
    // Após atualizar, buscar os detalhes atualizados do pedido
    if (response.data && response.status === 200) {
      const updatedOrder = await getOrderDetails(orderId);
      return updatedOrder;
    }
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar status do pedido ${orderId}:`, error);
    throw error;
  }
}

// Atualizar status de pagamento de um pedido
export async function updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus): Promise<any> {
  try {
    const response = await api.put(`/orders/${orderId}`, { payment_status: paymentStatus });
    // Após atualizar, buscar os detalhes atualizados do pedido
    if (response.data && response.status === 200) {
      const updatedOrder = await getOrderDetails(orderId);
      return updatedOrder;
    }
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar status de pagamento do pedido ${orderId}:`, error);
    throw error;
  }
}

// Cancelar um pedido
export async function cancelOrder(orderId: number): Promise<Order> {
  try {
    const response = await api.patch(`/orders/${orderId}`, { 
      status: 'cancelled',
      payment_status: 'failed'
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao cancelar pedido ${orderId}:`, error);
    throw error;
  }
}

// Atualizar status de um item do pedido
export async function updateOrderItemStatus(orderId: number, itemId: number, status: OrderStatus): Promise<any> {
  try {
    const response = await api.put(`/orders/${orderId}/items/${itemId}`, { status });
    
    // Após atualizar, buscar os detalhes atualizados do pedido
    if (response.data && response.status === 200) {
      const updatedOrder = await getOrderDetails(orderId);
      return updatedOrder;
    }
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar status do item ${itemId} do pedido ${orderId}:`, error);
    throw error;
  }
}
