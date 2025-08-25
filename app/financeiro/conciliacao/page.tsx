"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  CalendarIcon,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const conciliacaoData = [
  { mes: "Jan", conciliadas: 1250, pendentes: 45, divergentes: 12, taxa_conciliacao: 96.5 },
  { mes: "Fev", conciliadas: 1420, pendentes: 38, divergentes: 8, taxa_conciliacao: 97.2 },
  { mes: "Mar", conciliadas: 1180, pendentes: 52, divergentes: 15, taxa_conciliacao: 95.8 },
  { mes: "Abr", conciliadas: 1680, pendentes: 28, divergentes: 6, taxa_conciliacao: 98.1 },
  { mes: "Mai", conciliadas: 1520, pendentes: 35, divergentes: 9, taxa_conciliacao: 97.5 },
  { mes: "Jun", conciliadas: 1890, pendentes: 22, divergentes: 4, taxa_conciliacao: 98.8 },
]

const statusDistribuicao = [
  { nome: "Conciliadas", valor: 1890, cor: "#10B981" },
  { nome: "Pendentes", valor: 22, cor: "#F59E0B" },
  { nome: "Divergentes", valor: 4, cor: "#EF4444" },
]

const transacoesPendentes = [
  {
    id: "TXN001",
    data: new Date(2024, 0, 15),
    valor: 2450.0,
    banco: "Banco do Brasil",
    sistema: 2450.0,
    diferenca: 0,
    status: "pendente",
    motivo: "Aguardando confirmação bancária",
  },
  {
    id: "TXN002",
    data: new Date(2024, 0, 14),
    valor: 1500.0,
    banco: 1485.5,
    sistema: 1500.0,
    diferenca: -14.5,
    status: "divergente",
    motivo: "Diferença de taxa",
  },
  {
    id: "TXN003",
    data: new Date(2024, 0, 13),
    valor: 890.0,
    banco: 890.0,
    sistema: 890.0,
    diferenca: 0,
    status: "conciliada",
    motivo: "Conciliação automática",
  },
]

const bancoStats = [
  { banco: "Banco do Brasil", conciliadas: 456, pendentes: 8, divergentes: 2, taxa: 97.8 },
  { banco: "Itaú", conciliadas: 389, pendentes: 5, divergentes: 1, taxa: 98.5 },
  { banco: "Bradesco", conciliadas: 334, pendentes: 6, divergentes: 1, taxa: 98.0 },
  { banco: "Santander", conciliadas: 278, pendentes: 3, divergentes: 0, taxa: 99.0 },
]

export default function ConciliacaoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [bancoFilter, setBancoFilter] = useState("todos")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "conciliada":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pendente":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "divergente":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "conciliada":
        return <CheckCircle className="w-4 h-4" />
      case "pendente":
        return <AlertCircle className="w-4 h-4" />
      case "divergente":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const totalConciliadas = conciliacaoData[conciliacaoData.length - 1].conciliadas
  const totalPendentes = conciliacaoData[conciliacaoData.length - 1].pendentes
  const totalDivergentes = conciliacaoData[conciliacaoData.length - 1].divergentes
  const taxaConciliacao = conciliacaoData[conciliacaoData.length - 1].taxa_conciliacao

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Conciliação Bancária</h1>
                  <p className="text-gray-400">Reconciliação automática de transações bancárias</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Conciliadas</p>
                      <p className="text-2xl font-bold text-green-400">{totalConciliadas}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+12.5%</span>
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
                      <p className="text-gray-400 text-sm">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-400">{totalPendentes}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">-8.3%</span>
                      </div>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Divergentes</p>
                      <p className="text-2xl font-bold text-red-400">{totalDivergentes}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">-25.0%</span>
                      </div>
                    </div>
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa de Conciliação</p>
                      <p className="text-2xl font-bold text-white">{taxaConciliacao}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+2.3%</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Conciliation Trend */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Evolução da Conciliação</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={conciliacaoData}>
                      <defs>
                        <linearGradient id="conciliadasGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                      <Line
                        type="monotone"
                        dataKey="conciliadas"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pendentes"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={{ fill: "#F59E0B", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#F59E0B", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusDistribuicao}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="valor"
                        >
                          {statusDistribuicao.map((entry, index) => (
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
                    {statusDistribuicao.map((item) => (
                      <div key={item.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.cor }} />
                          <span className="text-white">{item.nome}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold">{item.valor}</span>
                          <p className="text-gray-400 text-sm">
                            {((item.valor / statusDistribuicao.reduce((sum, s) => sum + s.valor, 0)) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bank Performance */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Performance por Banco</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bancoStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="banco" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="conciliadas" fill="#10B981" name="Conciliadas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pendentes" fill="#F59E0B" name="Pendentes" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="divergentes" fill="#EF4444" name="Divergentes" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por ID ou valor..."
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
                      <SelectItem value="conciliada">Conciliadas</SelectItem>
                      <SelectItem value="pendente">Pendentes</SelectItem>
                      <SelectItem value="divergente">Divergentes</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={bancoFilter} onValueChange={setBancoFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Banco" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="todos">Todos os Bancos</SelectItem>
                      <SelectItem value="bb">Banco do Brasil</SelectItem>
                      <SelectItem value="itau">Itaú</SelectItem>
                      <SelectItem value="bradesco">Bradesco</SelectItem>
                      <SelectItem value="santander">Santander</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-auto bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Período
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="end">
                      <Calendar
                        mode="range"
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to,
                        }}
                        onSelect={(range) => {
                          setDateRange({
                            from: range?.from,
                            to: range?.to,
                          })
                        }}
                        numberOfMonths={2}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Transações para Conciliação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor Banco</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor Sistema</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Diferença</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoesPendentes.map((transacao) => (
                        <tr
                          key={transacao.id}
                          className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <span className="text-white font-mono text-sm">{transacao.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-300">
                              {format(transacao.data, "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white font-semibold">
                              R$ {transacao.banco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white font-semibold">
                              R$ {transacao.sistema.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`font-semibold ${
                                transacao.diferenca === 0
                                  ? "text-green-400"
                                  : transacao.diferenca > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                              }`}
                            >
                              {transacao.diferenca === 0
                                ? "—"
                                : `${transacao.diferenca > 0 ? "+" : ""}R$ ${transacao.diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(transacao.status)}>
                              {getStatusIcon(transacao.status)}
                              <span className="ml-1 capitalize">{transacao.status}</span>
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400 text-sm">{transacao.motivo}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
