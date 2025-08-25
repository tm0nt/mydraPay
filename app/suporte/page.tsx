"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Headphones,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const suporteStats = [
  { mes: "Jan", tickets: 145, resolvidos: 138, tempo_medio: 2.4, satisfacao: 4.2 },
  { mes: "Fev", tickets: 162, resolvidos: 156, tempo_medio: 2.1, satisfacao: 4.3 },
  { mes: "Mar", tickets: 128, resolvidos: 124, tempo_medio: 2.8, satisfacao: 4.1 },
  { mes: "Abr", tickets: 189, resolvidos: 182, tempo_medio: 2.0, satisfacao: 4.5 },
  { mes: "Mai", tickets: 156, resolvidos: 151, tempo_medio: 2.2, satisfacao: 4.4 },
  { mes: "Jun", tickets: 203, resolvidos: 198, tempo_medio: 1.8, satisfacao: 4.6 },
]

const categoriaTickets = [
  { categoria: "Técnico", quantidade: 89, cor: "#EF4444" },
  { categoria: "Financeiro", quantidade: 67, cor: "#F59E0B" },
  { categoria: "Conta", quantidade: 34, cor: "#8B5CF6" },
  { categoria: "Outros", quantidade: 13, cor: "#10B981" },
]

const ticketsRecentes = [
  {
    id: "SUP001",
    titulo: "Erro ao processar PIX",
    categoria: "Técnico",
    prioridade: "alta",
    status: "aberto",
    cliente: "João Silva",
    data_criacao: new Date(2024, 0, 15, 14, 30),
    ultima_resposta: new Date(2024, 0, 15, 16, 45),
    tempo_resposta: "2h 15m",
  },
  {
    id: "SUP002",
    titulo: "Dúvida sobre taxas",
    categoria: "Financeiro",
    prioridade: "media",
    status: "em_andamento",
    cliente: "Maria Santos",
    data_criacao: new Date(2024, 0, 15, 10, 20),
    ultima_resposta: new Date(2024, 0, 15, 11, 30),
    tempo_resposta: "1h 10m",
  },
  {
    id: "SUP003",
    titulo: "Problema no login",
    categoria: "Conta",
    prioridade: "baixa",
    status: "resolvido",
    cliente: "Pedro Costa",
    data_criacao: new Date(2024, 0, 14, 16, 45),
    ultima_resposta: new Date(2024, 0, 14, 17, 20),
    tempo_resposta: "35m",
  },
]

const faqItems = [
  {
    pergunta: "Como fazer um PIX?",
    resposta: "Para fazer um PIX, acesse a seção 'Saques', selecione PIX e informe a chave do destinatário.",
    categoria: "PIX",
    visualizacoes: 1250,
  },
  {
    pergunta: "Quais são as taxas cobradas?",
    resposta: "PIX: 0,15% | Cartão: 3,5% | Boleto: R$ 2,50 fixo",
    categoria: "Taxas",
    visualizacoes: 890,
  },
  {
    pergunta: "Como alterar minha senha?",
    resposta: "Vá em Configurações > Segurança > Alterar Senha",
    categoria: "Conta",
    visualizacoes: 567,
  },
]

export default function SuportePage() {
  const [activeTab, setActiveTab] = useState("tickets")
  const [novoTicket, setNovoTicket] = useState({
    titulo: "",
    categoria: "",
    prioridade: "",
    descricao: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  const totalTickets = suporteStats[suporteStats.length - 1].tickets
  const totalResolvidos = suporteStats[suporteStats.length - 1].resolvidos
  const tempoMedio = suporteStats[suporteStats.length - 1].tempo_medio
  const satisfacaoMedia = suporteStats[suporteStats.length - 1].satisfacao
  const taxaResolucao = (totalResolvidos / totalTickets) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "em_andamento":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "resolvido":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "bg-red-500/20 text-red-400"
      case "media":
        return "bg-yellow-500/20 text-yellow-400"
      case "baixa":
        return "bg-green-500/20 text-green-400"
      default:
        return "bg-gray-500/20 text-gray-400"
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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Suporte</h1>
                  <p className="text-gray-400">Central de atendimento e tickets</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo Ticket
              </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Tickets Abertos</p>
                      <p className="text-2xl font-bold text-white">{totalTickets}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+8.2%</span>
                      </div>
                    </div>
                    <MessageCircle className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa de Resolução</p>
                      <p className="text-2xl font-bold text-green-400">{taxaResolucao.toFixed(1)}%</p>
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
                      <p className="text-gray-400 text-sm">Tempo Médio</p>
                      <p className="text-2xl font-bold text-blue-400">{tempoMedio}h</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">+0.2h</span>
                      </div>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Satisfação</p>
                      <p className="text-2xl font-bold text-yellow-400">{satisfacaoMedia}/5</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+0.2</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Support Trend */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Evolução dos Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={suporteStats}>
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
                      <Line
                        type="monotone"
                        dataKey="tickets"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#8B5CF6", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resolvidos"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Tickets por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoriaTickets}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="quantidade"
                        >
                          {categoriaTickets.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {categoriaTickets.map((categoria) => (
                      <div key={categoria.categoria} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoria.cor }} />
                          <span className="text-white">{categoria.categoria}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold">{categoria.quantidade}</span>
                          <p className="text-gray-400 text-sm">
                            {(
                              (categoria.quantidade / categoriaTickets.reduce((sum, c) => sum + c.quantidade, 0)) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="tickets" className="data-[state=active]:bg-purple-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Tickets
                </TabsTrigger>
                <TabsTrigger value="criar" className="data-[state=active]:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Ticket
                </TabsTrigger>
                <TabsTrigger value="faq" className="data-[state=active]:bg-purple-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="contato" className="data-[state=active]:bg-purple-600">
                  <Headphones className="w-4 h-4 mr-2" />
                  Contato
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tickets" className="space-y-6">
                {/* Filters */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar tickets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
                        />
                      </div>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="aberto">Aberto</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="resolvido">Resolvido</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tickets List */}
                <div className="space-y-4">
                  {ticketsRecentes.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                              <MessageCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{ticket.titulo}</h3>
                              <p className="text-gray-400">
                                {ticket.id} • {ticket.cliente}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getPrioridadeColor(ticket.prioridade)}>{ticket.prioridade}</Badge>
                            <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Categoria</p>
                            <p className="text-white font-medium">{ticket.categoria}</p>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Criado em</p>
                            <p className="text-white font-medium">
                              {format(ticket.data_criacao, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Última Resposta</p>
                            <p className="text-white font-medium">
                              {format(ticket.ultima_resposta, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="bg-gray-800/30 rounded-lg p-3">
                            <p className="text-gray-400 text-sm">Tempo de Resposta</p>
                            <p className="text-blue-400 font-medium">{ticket.tempo_resposta}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                          >
                            Ver Detalhes
                          </Button>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                            Responder
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="criar" className="space-y-6">
                {/* Create Ticket Form */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Criar Novo Ticket</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Título do Ticket</Label>
                        <Input
                          placeholder="Descreva brevemente o problema"
                          value={novoTicket.titulo}
                          onChange={(e) => setNovoTicket((prev) => ({ ...prev, titulo: e.target.value }))}
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Categoria</Label>
                        <Select
                          value={novoTicket.categoria}
                          onValueChange={(value) => setNovoTicket((prev) => ({ ...prev, categoria: value }))}
                        >
                          <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="conta">Conta</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Prioridade</Label>
                      <Select
                        value={novoTicket.prioridade}
                        onValueChange={(value) => setNovoTicket((prev) => ({ ...prev, prioridade: value }))}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Descrição Detalhada</Label>
                      <Textarea
                        placeholder="Descreva o problema em detalhes..."
                        value={novoTicket.descricao}
                        onChange={(e) => setNovoTicket((prev) => ({ ...prev, descricao: e.target.value }))}
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-32"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent">
                        Cancelar
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                {/* FAQ Items */}
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <Card key={index} className="bg-gray-900/50 border-gray-800/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-semibold text-lg">{item.pergunta}</h3>
                          <Badge className="bg-blue-500/20 text-blue-400">{item.categoria}</Badge>
                        </div>
                        <p className="text-gray-300 mb-4">{item.resposta}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{item.visualizacoes} visualizações</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="contato" className="space-y-6">
                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">Telefone</h3>
                      <p className="text-gray-400 mb-4">Atendimento 24/7</p>
                      <p className="text-white font-mono">0800 123 4567</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">Email</h3>
                      <p className="text-gray-400 mb-4">Resposta em até 2h</p>
                      <p className="text-white">suporte@empresa.com</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">Chat Online</h3>
                      <p className="text-gray-400 mb-4">Resposta imediata</p>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">Iniciar Chat</Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Support Hours */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Horários de Atendimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-semibold mb-3">Suporte Técnico</h4>
                        <div className="space-y-2 text-gray-300">
                          <p>Segunda a Sexta: 08:00 - 18:00</p>
                          <p>Sábado: 09:00 - 15:00</p>
                          <p>Domingo: Fechado</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-3">Suporte Financeiro</h4>
                        <div className="space-y-2 text-gray-300">
                          <p>Segunda a Sexta: 24 horas</p>
                          <p>Fins de semana: 24 horas</p>
                          <p>Feriados: 24 horas</p>
                        </div>
                      </div>
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
