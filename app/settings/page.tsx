"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  SettingsIcon,
  Bell,
  Shield,
  Palette,
  Database,
  Trash2,
  Download,
  Upload,
  Key,
  Code,
  Webhook,
  Globe2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "geral"

  const [activeTab, setActiveTab] = useState(defaultTab)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [secretKeyVisible, setSecretKeyVisible] = useState(false)

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    appearance: {
      theme: "dark",
      language: "pt-BR",
      currency: "BRL",
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: "30",
      loginAlerts: true,
    },
  })

  const [apiCredentials] = useState({
    apiKey: "aura_live_sk_1234567890abcdef",
    secretKey: "aura_secret_abcdef1234567890",
    webhookUrl: "https://meusite.com/webhook/aura",
  })

  const [allowedIPs] = useState([
    { id: 1, ip: "192.168.1.100", description: "Servidor Principal", active: true },
    { id: 2, ip: "10.0.0.50", description: "Servidor de Backup", active: true },
    { id: 3, ip: "203.45.67.89", description: "VPS Produção", active: false },
  ])

  const [webhooks] = useState([
    {
      id: 1,
      name: "Webhook Principal",
      url: "https://meusite.com/webhook/payments",
      events: ["payment.approved", "payment.rejected", "pix.received"],
      active: true,
      lastCall: new Date(2024, 0, 15, 14, 30),
    },
    {
      id: 2,
      name: "Webhook Backup",
      url: "https://backup.meusite.com/webhook",
      events: ["payment.approved"],
      active: false,
      lastCall: new Date(2024, 0, 10, 9, 15),
    },
  ])

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl border border-gray-800/50 bg-gray-900/50" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
                  <p className="text-gray-400">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </header>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
                <TabsTrigger value="geral" className="data-[state=active]:bg-purple-600">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="data-[state=active]:bg-purple-600">
                  <Bell className="w-4 h-4 mr-2" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="data-[state=active]:bg-purple-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-purple-600">
                  <Code className="w-4 h-4 mr-2" />
                  API
                </TabsTrigger>
                <TabsTrigger value="dados" className="data-[state=active]:bg-purple-600">
                  <Database className="w-4 h-4 mr-2" />
                  Dados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Aparência */}
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-400" />
                        Aparência
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Tema</Label>
                        <Select
                          value={settings.appearance.theme}
                          onValueChange={(value) => updateSetting("appearance", "theme", value)}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="auto">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Idioma</Label>
                        <Select
                          value={settings.appearance.language}
                          onValueChange={(value) => updateSetting("appearance", "language", value)}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Moeda</Label>
                        <Select
                          value={settings.appearance.currency}
                          onValueChange={(value) => updateSetting("appearance", "currency", value)}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="BRL">Real (R$)</SelectItem>
                            <SelectItem value="USD">Dólar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Privacidade */}
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        Privacidade
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Perfil Público</p>
                          <p className="text-gray-400 text-sm">Permitir que outros vejam seu perfil</p>
                        </div>
                        <Switch
                          checked={settings.privacy.profileVisible}
                          onCheckedChange={(checked) => updateSetting("privacy", "profileVisible", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Compartilhamento de Dados</p>
                          <p className="text-gray-400 text-sm">Compartilhar dados para melhorias</p>
                        </div>
                        <Switch
                          checked={settings.privacy.dataSharing}
                          onCheckedChange={(checked) => updateSetting("privacy", "dataSharing", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Analytics</p>
                          <p className="text-gray-400 text-sm">Permitir coleta de dados de uso</p>
                        </div>
                        <Switch
                          checked={settings.privacy.analytics}
                          onCheckedChange={(checked) => updateSetting("privacy", "analytics", checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notificacoes" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                      Preferências de Notificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Notificações por Email</p>
                        <p className="text-gray-400 text-sm">Receba atualizações importantes por email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => updateSetting("notifications", "email", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Notificações Push</p>
                        <p className="text-gray-400 text-sm">Receba notificações no navegador</p>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => updateSetting("notifications", "push", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">SMS</p>
                        <p className="text-gray-400 text-sm">Alertas críticos por mensagem</p>
                      </div>
                      <Switch
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => updateSetting("notifications", "sms", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Marketing</p>
                        <p className="text-gray-400 text-sm">Novidades e ofertas especiais</p>
                      </div>
                      <Switch
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) => updateSetting("notifications", "marketing", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seguranca" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Configurações de Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Autenticação de Dois Fatores</p>
                        <p className="text-gray-400 text-sm">Proteja sua conta com 2FA</p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactor}
                        onCheckedChange={(checked) => updateSetting("security", "twoFactor", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Timeout da Sessão (minutos)</Label>
                      <Select
                        value={settings.security.sessionTimeout}
                        onValueChange={(value) => updateSetting("security", "sessionTimeout", value)}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="never">Nunca</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Alertas de Login</p>
                        <p className="text-gray-400 text-sm">Notificar sobre novos acessos</p>
                      </div>
                      <Switch
                        checked={settings.security.loginAlerts}
                        onCheckedChange={(checked) => updateSetting("security", "loginAlerts", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6">
                {/* Credenciais da API */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-yellow-400" />
                      Credenciais da API
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          type={apiKeyVisible ? "text" : "password"}
                          value={apiCredentials.apiKey}
                          readOnly
                          className="bg-gray-800/50 border-gray-700/50 text-white font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                          className="border-gray-700/50 hover:bg-gray-800/50"
                        >
                          {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(apiCredentials.apiKey)}
                          className="border-gray-700/50 hover:bg-gray-800/50"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Secret Key</Label>
                      <div className="flex gap-2">
                        <Input
                          type={secretKeyVisible ? "text" : "password"}
                          value={apiCredentials.secretKey}
                          readOnly
                          className="bg-gray-800/50 border-gray-700/50 text-white font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSecretKeyVisible(!secretKeyVisible)}
                          className="border-gray-700/50 hover:bg-gray-800/50"
                        >
                          {secretKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(apiCredentials.secretKey)}
                          className="border-gray-700/50 hover:bg-gray-800/50"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerar Chaves
                      </Button>
                      <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent">
                        Ver Documentação
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* IPs Liberados */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Globe2 className="w-5 h-5 text-blue-400" />
                      IPs Liberados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allowedIPs.map((ip) => (
                      <div key={ip.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div>
                          <p className="text-white font-medium">{ip.ip}</p>
                          <p className="text-gray-400 text-sm">{ip.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={ip.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                          >
                            {ip.active ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Adicionar Novo IP</Button>
                  </CardContent>
                </Card>

                {/* Webhooks */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-orange-400" />
                      Webhooks Cadastrados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="p-4 bg-gray-800/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{webhook.name}</h4>
                            <p className="text-gray-400 text-sm font-mono">{webhook.url}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                webhook.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                              }
                            >
                              {webhook.active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                            >
                              Editar
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} className="bg-purple-500/20 text-purple-400 text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-gray-500 text-xs">
                          Última chamada: {webhook.lastCall.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}

                    <Button className="w-full bg-orange-600 hover:bg-orange-700">Adicionar Novo Webhook</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dados" className="space-y-6">
                {/* Data Management */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-orange-400" />
                      Gerenciamento de Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="border-gray-700/50 hover:bg-gray-800/50 h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      >
                        <Download className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">Exportar Dados</span>
                        <span className="text-gray-400 text-xs text-center">Baixe todos os seus dados</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="border-gray-700/50 hover:bg-gray-800/50 h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      >
                        <Upload className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">Importar Dados</span>
                        <span className="text-gray-400 text-xs text-center">Importe dados de outras plataformas</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="border-red-700/50 hover:bg-red-500/10 h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Excluir Conta</span>
                        <span className="text-gray-400 text-xs text-center">Remover permanentemente</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8">Salvar Configurações</Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
