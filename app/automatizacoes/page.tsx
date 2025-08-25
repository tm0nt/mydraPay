"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts"
import {
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bot,
  Activity,
} from "lucide-react"

const automacaoStats = [
  { mes: "Jan", executadas: 1250, sucesso: 1198, falhas: 52, economia_tempo: 45 },
  { mes: "Fev", executadas: 1420, sucesso: 1378, falhas: 42, economia_tempo: 52 },
  { mes: "Mar", executadas: 1180, sucesso: 1142, falhas: 38, economia_tempo: 43 },
  { mes: "Abr", executadas: 1680, sucesso: 1634, falhas: 46, economia_tempo: 61 },
  { mes: "Mai", executadas: 1520, sucesso: 1489, falhas: 31, economia_tempo: 55 },
  { mes: "Jun", executadas: 1890, sucesso: 1852, falhas: 38, economia_tempo: 68 },
]

const tiposAutomacao = [
  { tipo: "Conciliação", execucoes: 456, taxa_sucesso: 98.2, cor: "#10B981" },
  { tipo: "Notificações", execucoes: 389, taxa_sucesso: 99.1, cor: "#06B6D4" },
  { tipo: "Relatórios", execucoes: 334, taxa_sucesso: 97.8, cor: "#8B5CF6" },
  { tipo: "Backup", execucoes: 278, taxa_sucesso: 99.6, cor: "#F59E0B" },
]

const automacoesCriadas = [
  {
    id: "AUTO001",
    nome: "Conciliação Automática PIX",
    tipo: "Conciliação",
    status: "ativa",
    trigger: "Novo PIX recebido",
    acoes: ["Verificar no banco", "Atualizar saldo", "Enviar notificação"],
    ultima_execucao: new Date(2024, 0, 15, 14, 30),
    execucoes_mes: 456,
    taxa_sucesso: 98.2,
  },
  {
    id: "AUTO002",
    nome: "Relatório Diário de Vendas",
    tipo: "Relatório",
    status: "ativa",
    trigger: "Todos os dias às 08:00",
    acoes: ["Gerar relatório", "Enviar por email", "Salvar no sistema"],
    ultima_execucao: new Date(2024, 0, 15, 8, 0),
    execucoes_mes: 30,
    taxa_sucesso: 100,
  },
  {
    id: "AUTO003",
    nome: "Backup Semanal",
    tipo: "Backup",
    status: "pausada",
    trigger: "Toda segunda-feira às 02:00",
    acoes: ["Backup banco de dados", "Comprimir arquivos", "Enviar para nuvem"],
    ultima_execucao: new Date(2024, 0, 8, 2, 0),
    execucoes_mes: 4,
    taxa_sucesso: 100,
  },
]

export default function AutomatizacoesPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [novaAutomacao, setNovaAutomacao] = useState({
    nome: "",
    tipo: "",
    trigger: "",
    condicoes: "",
    acoes: "",
  })

  const totalExecutadas = automacaoStats.reduce((sum, item) => sum + item.executadas, 0)
  const totalSucesso = automacaoStats.reduce((sum, item) => sum + item.sucesso, 0)
  const totalFalhas = automacaoStats.reduce((sum, item) => sum + item.falhas, 0)
  const economiaTotal = automacaoStats.reduce((sum, item) => sum + item.economia_tempo, 0)
  const taxaSucessoGeral = (totalSucesso / totalExecutadas) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pausada":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "erro":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativa":
        return <Play className="w-4 h-4" />
      case "pausada":
        return <Pause className="w-4 h-4" />
      case "erro":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Automatizações</h1>
                  <p className="text-gray-400">Gerencie regras e fluxos automatizados</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nova Automação
              </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Execuções Totais</p>
                      <p className="text-2xl font-bold text-white">{totalExecutadas.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+24.5%</span>
                      </div>
                    </div>
                    <Bot className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa de Sucesso</p>
                      <p className="text-2xl font-bold text-green-400">{taxaSucessoGeral.toFixed(1)}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+2.1%</span>
                      </div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Falhas</p>
                      <p className="text-2xl font-bold text-red-400">{totalFalhas}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">+8.7%</span>
                      </div>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Tempo Economizado</p>
                      <p className="text-2xl font-bold text-blue-400">{economiaTotal}h</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+18.2%</span>
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                  <Activity className="w-4 h-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="automacoes" className="data-[state=active]:bg-purple-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Minhas Automações
                </TabsTrigger>
                <TabsTrigger value="criar" className="data-[state=active]:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Nova
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Performance Chart */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Performance das Automações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={automacaoStats}>
                        <defs>
                          <linearGradient id="sucessoGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="falhasGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="mes" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="sucesso"
                          stackId="1"
                          stroke="#10B981"
                          fillOpacity={1}
                          fill="url(#sucessoGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="falhas"
                          stackId="2"
                          stroke="#EF4444"
                          fillOpacity={1}
                          fill="url(#falhasGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Automation Types */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Performance por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={tiposAutomacao}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="tipo" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="execucoes" fill="#8B5CF6" name="Execuções" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automacoes" className="space-y-6">
                {/* Automation List */}
                <div className="grid gap-6">
                  {automacoesCriadas.map((automacao) => (
                    <Card key={automacao.id} className="bg-gray-900/50 border-gray-800/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                              <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{automacao.nome}</h3>
                              <p className="text-gray-400">{automacao.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(automacao.status)}>
                              {getStatusIcon(automacao.status)}
                              <span className="ml-1 capitalize">{automacao.status}</span>
                            </Badge>
                            <Switch checked={automacao.status === "ativa"} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Tipo</p>
                            <p className="text-white font-medium">{automacao.tipo}</p>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Execuções/Mês</p>
                            <p className="text-white font-medium">{automacao.execucoes_mes}</p>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Taxa de Sucesso</p>
                            <p className="text-green-400 font-medium">{automacao.taxa_sucesso}%</p>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Última Execução</p>
                            <p className="text-white font-medium">
                              {automacao.ultima_execucao.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Trigger:</p>
                            <p className="text-white">{automacao.trigger}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Ações:</p>
                            <div className="flex flex-wrap gap-2">
                              {automacao.acoes.map((acao, index) => (
                                <Badge key={index} className="bg-blue-500/20 text-blue-400">
                                  {acao}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Configurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                          >
                            Ver Logs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="criar" className="space-y-6">
                {/* Create Automation Form */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Criar Nova Automação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Nome da Automação</Label>
                        <Input
                          placeholder="Ex: Backup Diário"
                          value={novaAutomacao.nome}
                          onChange={(e) => setNovaAutomacao((prev) => ({ ...prev, nome: e.target.value }))}
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Tipo</Label>
                        <Select
                          value={novaAutomacao.tipo}
                          onValueChange={(value) => setNovaAutomacao((prev) => ({ ...prev, tipo: value }))}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="conciliacao">Conciliação</SelectItem>
                            <SelectItem value="notificacao">Notificação</SelectItem>
                            <SelectItem value="relatorio">Relatório</SelectItem>
                            <SelectItem value="backup">Backup</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Trigger (Gatilho)</Label>
                      <Input
                        placeholder="Ex: Todos os dias às 08:00"
                        value={novaAutomacao.trigger}
                        onChange={(e) => setNovaAutomacao((prev) => ({ ...prev, trigger: e.target.value }))}
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Condições</Label>
                      <Textarea
                        placeholder="Descreva as condições para execução..."
                        value={novaAutomacao.condicoes}
                        onChange={(e) => setNovaAutomacao((prev) => ({ ...prev, condicoes: e.target.value }))}
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Ações</Label>
                      <Textarea
                        placeholder="Descreva as ações a serem executadas..."
                        value={novaAutomacao.acoes}
                        onChange={(e) => setNovaAutomacao((prev) => ({ ...prev, acoes: e.target.value }))}
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent">
                        Cancelar
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Zap className="w-4 h-4 mr-2" />
                        Criar Automação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
