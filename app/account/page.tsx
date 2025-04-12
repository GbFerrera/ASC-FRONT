"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/services/orders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff, FileText, Clock, CreditCard, ChevronRight, LogOut, Phone, MapPin } from "lucide-react";
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
