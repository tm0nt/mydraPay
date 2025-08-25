"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Zap, Users, Download, Filter, Award } from "lucide-react"

const performanceData = [
  { mes: "Jan", conversao: 78, tempo_resposta: 1.2, satisfacao: 4.2, vendas: 45 },
  { mes: "Fev", conversao: 82, tempo_resposta: 1.1, satisfacao: 4.3, vendas: 52 },
  { mes: "Mar", conversao: 75, tempo_resposta: 1.4, satisfacao: 4.1, vendas: 48 },
  { mes: "Abr", conversao: 85, tempo_resposta: 1.0, satisfacao: 4.5, vendas: 61 },
  { mes: "Mai", conversao: 88, tempo_resposta: 0.9, satisfacao: 4.4, vendas: 55 },
  { mes: "Jun", conversao: 92, tempo_resposta: 0.8, satisfacao: 4.6, vendas: 67 },
]

const kpiData = [
  { nome: "Taxa de Conversão", valor: 92, meta: 85, unidade: "%", variacao: 8.2, cor: "#10B981" },
  { nome: "Tempo de Resposta", valor: 0.8, meta: 1.0, unidade: "s", variacao: -20, cor: "#06B6D4" },
  { nome: "Satisfação Cliente", valor: 4.6, meta: 4.0, unidade: "/5", variacao: 15, cor: "#F59E0B" },
  { nome: "Uptime Sistema", valor: 99.9, meta: 99.5, unidade: "%", variacao: 0.4, cor: "#8B5CF6" },
]

const metricasDetalhadas = [
  {
    categoria: "Vendas",
    metricas: [
      { nome: "Ticket Médio", valor: "R$ 156", variacao: 12.5, positiva: true },
      { nome: "Produtos por Venda", valor: "2.3", variacao: -5.2, positiva: false },
      { nome: "Taxa de Abandono", valor: "15%", variacao: -8.1, positiva: true },
    ],
  },
  {
    categoria: "Atendimento",
    metricas: [
      { nome: "Tempo Médio Resposta", valor: "0.8s", variacao: -20.0, positiva: true },
      { nome: "Tickets Resolvidos", valor: "98%", variacao: 3.2, positiva: true },
      { nome: "Avaliação Média", valor: "4.6/5", variacao: 8.7, positiva: true },
    ],
  },
  {
    categoria: "Sistema",
    metricas: [
      { nome: "Disponibilidade", valor: "99.9%", variacao: 0.1, positiva: true },
      { nome: "Latência API", valor: "45ms", variacao: -12.3, positiva: true },
      { nome: "Erros por Hora", valor: "0.02", variacao: -67.8, positiva: true },
    ],
  },
]

export default function RelatorioPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6-meses")
  const [selectedMetric, setSelectedMetric] = useState("conversao")

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Relatório de Performance</h1>
                  <p className="text-gray-400">Monitore KPIs e métricas de desempenho</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </header>

            {/* Filters */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="3-meses">Últimos 3 meses</SelectItem>
                      <SelectItem value="6-meses">Últimos 6 meses</SelectItem>
                      <SelectItem value="1-ano">Último ano</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Métrica Principal" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="conversao">Taxa de Conversão</SelectItem>
                      <SelectItem value="tempo_resposta">Tempo de Resposta</SelectItem>
                      <SelectItem value="satisfacao">Satisfação</SelectItem>
                      <SelectItem value="vendas">Volume de Vendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {kpiData.map((kpi, index) => (
                <Card key={kpi.nome} className="bg-gray-900/50 border-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kpi.cor }} />
                        <p className="text-gray-400 text-sm">{kpi.nome}</p>
                      </div>
                      {kpi.variacao > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        {kpi.valor}
                        {kpi.unidade}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Meta: {kpi.meta}
                          {kpi.unidade}
                        </span>
                        <span className={`font-medium ${kpi.variacao > 0 ? "text-green-400" : "text-red-400"}`}>
                          {kpi.variacao > 0 ? "+" : ""}
                          {kpi.variacao}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((kpi.valor / kpi.meta) * 100, 100)}%`,
                            backgroundColor: kpi.cor,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Chart */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Evolução da Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorConversao" x1="0" y1="0" x2="0" y2="1">
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
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorConversao)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {metricasDetalhadas.map((categoria) => (
                <Card key={categoria.categoria} className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      {categoria.categoria === "Vendas" && <Target className="w-5 h-5 text-green-400" />}
                      {categoria.categoria === "Atendimento" && <Users className="w-5 h-5 text-blue-400" />}
                      {categoria.categoria === "Sistema" && <Zap className="w-5 h-5 text-purple-400" />}
                      {categoria.categoria}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categoria.metricas.map((metrica) => (
                      <div
                        key={metrica.nome}
                        className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl"
                      >
                        <div>
                          <p className="text-white font-medium">{metrica.nome}</p>
                          <p className="text-2xl font-bold text-white mt-1">{metrica.valor}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {metrica.positiva ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span
                              className={`text-sm font-medium ${metrica.positiva ? "text-green-400" : "text-red-400"}`}
                            >
                              {metrica.positiva ? "+" : ""}
                              {metrica.variacao}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Score */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Score de Performance Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ score: 87 }]}>
                      <RadialBar dataKey="score" cornerRadius={10} fill="#8B5CF6" background={{ fill: "#374151" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                  <p className="text-4xl font-bold text-white mb-2">87/100</p>
                  <p className="text-gray-400">Performance Excelente</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Badge className="bg-green-500/20 text-green-400">+5 pontos vs mês anterior</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
