"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { api } from '@/services/api'
import { toast } from 'sonner'

interface AsaasConfig {
  api_key: string | null;
  is_active: boolean;
}

export default function BanksPage() {
  const [config, setConfig] = useState<AsaasConfig>({
    api_key: null,
    is_active: false
  });
  const [newApiKey, setNewApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/asaas/config');
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar configuração do ASAAS');
    }
  };

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      // Se tiver uma nova API key, envia ela. Se não, envia undefined para apenas atualizar o status
      const data: Partial<AsaasConfig> = {
        is_active: config.is_active
      };
      
      if (newApiKey) {
        data.api_key = newApiKey;
      }
      
      await api.post('/asaas/config', data);
      
      toast.success('Configuração do ASAAS atualizada com sucesso');
      setNewApiKey(''); // Limpa o campo de nova API key
      loadConfig(); // Recarrega para pegar a API key mascarada
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar configuração do ASAAS');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await api.get('/asaas/test-connection');
      toast.success('Conexão com ASAAS estabelecida com sucesso!');
      console.log('Saldo:', response.data.balance);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao testar conexão com ASAAS');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integração Bancária</h1>
      </div>

      <div className="grid gap-8">
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">ASAAS</h2>
              <p className="text-sm text-gray-500">Configuração da integração com ASAAS</p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="asaas-active">Ativar Integração</Label>
              <Switch
                id="asaas-active"
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="api-key">API Key Atual</Label>
              <Input
                type="text"
                id="api-key"
                value={config.api_key || ''}
                disabled
                className="bg-gray-50"
              />
              
              <Label htmlFor="new-api-key" className="mt-4">Nova API Key</Label>
              <Input
                type="password"
                id="new-api-key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Digite a nova API Key do ASAAS"
              />
              <p className="text-sm text-gray-500">
                Deixe em branco para manter a API Key atual. A chave de API pode ser obtida no painel do ASAAS em Configurações {'>'} Integrações
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleUpdateConfig}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Configuração'}
              </Button>

              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testingConnection || !config.is_active}
              >
                {testingConnection ? 'Testando...' : 'Testar Conexão'}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              • Mantenha sua API Key em segurança e nunca compartilhe com terceiros<br />
              • Em caso de comprometimento da API Key, gere uma nova imediatamente no painel do ASAAS<br />
              • Quando a integração estiver desativada, as funcionalidades do ASAAS não estarão disponíveis
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
