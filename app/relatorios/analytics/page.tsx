"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Eye,
  Users,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Download,
  Filter,
  BarChart3,
} from "lucide-react"

const audienciaData = [
  { mes: "Jan", usuarios: 1250, sessoes: 2100, pageviews: 8400, bounce_rate: 45 },
  { mes: "Fev", usuarios: 1420, sessoes: 2380, pageviews: 9520, bounce_rate: 42 },
  { mes: "Mar", usuarios: 1180, sessoes: 1980, pageviews: 7920, bounce_rate: 48 },
  { mes: "Abr", usuarios: 1680, sessoes: 2840, pageviews: 11360, bounce_rate: 38 },
  { mes: "Mai", usuarios: 1520, sessoes: 2560, pageviews: 10240, bounce_rate: 40 },
  { mes: "Jun", usuarios: 1890, sessoes: 3200, pageviews: 12800, bounce_rate: 35 },
]

const dispositivosData = [
  { nome: "Desktop", valor: 45, cor: "#8B5CF6" },
  { nome: "Mobile", valor: 38, cor: "#06B6D4" },
  { nome: "Tablet", valor: 17, cor: "#F59E0B" },
]

const fontesTrafegoData = [
  { fonte: "Orgânico", usuarios: 890, percentual: 47, cor: "#10B981" },
  { fonte: "Direto", usuarios: 567, percentual: 30, cor: "#8B5CF6" },
  { fonte: "Social", usuarios: 284, percentual: 15, cor: "#06B6D4" },
  { fonte: "Email", usuarios: 151, percentual: 8, cor: "#F59E0B" },
]

const paginasPopularesData = [
  { pagina: "/dashboard", visualizacoes: 12500, tempo_medio: "3:45", bounce_rate: 25 },
  { pagina: "/transacoes", visualizacoes: 8900, tempo_medio: "2:30", bounce_rate: 35 },
  { pagina: "/saques", visualizacoes: 6700, tempo_medio: "4:20", bounce_rate: 28 },
  { pagina: "/relatorios", visualizacoes: 5400, tempo_medio: "5:15", bounce_rate: 22 },
  { pagina: "/configuracoes", visualizacoes: 3200, tempo_medio: "2:10", bounce_rate: 45 },
]

const COLORS = ["#8B5CF6", "#06B6D4", "#F59E0B", "#10B981", "#EF4444"]

export default function RelatorioAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30-dias")
  const [activeTab, setActiveTab] = useState("audiencia")

  const totalUsuarios = audienciaData.reduce((sum, item) => sum + item.usuarios, 0)
  const totalSessoes = audienciaData.reduce((sum, item) => sum + item.sessoes, 0)
  const totalPageviews = audienciaData.reduce((sum, item) => sum + item.pageviews, 0)
  const bounceRateMedia = audienciaData.reduce((sum, item) => sum + item.bounce_rate, 0) / audienciaData.length

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics</h1>
                  <p className="text-gray-400">Análise detalhada do comportamento dos usuários</p>
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

            {/* Period Filter */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="7-dias">Últimos 7 dias</SelectItem>
                      <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="90-dias">Últimos 90 dias</SelectItem>
                      <SelectItem value="1-ano">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Usuários Únicos</p>
                      <p className="text-2xl font-bold text-white">{totalUsuarios.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+24.5%</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Sessões</p>
                      <p className="text-2xl font-bold text-white">{totalSessoes.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+18.2%</span>
                      </div>
                    </div>
                    <MousePointer className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Visualizações</p>
                      <p className="text-2xl font-bold text-white">{totalPageviews.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+15.7%</span>
                      </div>
                    </div>
                    <Eye className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taxa de Rejeição</p>
                      <p className="text-2xl font-bold text-white">{bounceRateMedia.toFixed(1)}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">-8.3%</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="audiencia" className="data-[state=active]:bg-purple-600">
                  Audiência
                </TabsTrigger>
                <TabsTrigger value="comportamento" className="data-[state=active]:bg-purple-600">
                  Comportamento
                </TabsTrigger>
                <TabsTrigger value="aquisicao" className="data-[state=active]:bg-purple-600">
                  Aquisição
                </TabsTrigger>
                <TabsTrigger value="tecnologia" className="data-[state=active]:bg-purple-600">
                  Tecnologia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audiencia" className="space-y-6">
                {/* Audience Chart */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Evolução da Audiência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={audienciaData}>
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
                        <Line type="monotone" dataKey="usuarios" stroke="#8B5CF6" strokeWidth={3} name="Usuários" />
                        <Line type="monotone" dataKey="sessoes" stroke="#06B6D4" strokeWidth={3} name="Sessões" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">Faixa Etária</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { faixa: "18-24", percentual: 15, usuarios: 284 },
                          { faixa: "25-34", percentual: 35, usuarios: 662 },
                          { faixa: "35-44", percentual: 28, usuarios: 529 },
                          { faixa: "45-54", percentual: 15, usuarios: 284 },
                          { faixa: "55+", percentual: 7, usuarios: 132 },
                        ].map((item) => (
                          <div key={item.faixa} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white">{item.faixa} anos</span>
                              <span className="text-gray-400">
                                {item.percentual}% ({item.usuarios})
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div
                                className="h-2 bg-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${item.percentual}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">Localização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { cidade: "São Paulo", usuarios: 567, percentual: 30 },
                          { cidade: "Rio de Janeiro", usuarios: 378, percentual: 20 },
                          { cidade: "Belo Horizonte", usuarios: 189, percentual: 10 },
                          { cidade: "Brasília", usuarios: 151, percentual: 8 },
                          { cidade: "Outras", usuarios: 605, percentual: 32 },
                        ].map((item) => (
                          <div
                            key={item.cidade}
                            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-blue-400" />
                              <span className="text-white">{item.cidade}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{item.usuarios}</p>
                              <p className="text-gray-400 text-sm">{item.percentual}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comportamento" className="space-y-6">
                {/* Popular Pages */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Páginas Mais Visitadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800/50">
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Página</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Visualizações</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Tempo Médio</th>
                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Taxa Rejeição</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginasPopularesData.map((pagina, index) => (
                            <tr
                              key={pagina.pagina}
                              className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <span className="text-white font-medium">{pagina.pagina}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-white">{pagina.visualizacoes.toLocaleString()}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-white">{pagina.tempo_medio}</span>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`${
                                    pagina.bounce_rate < 30
                                      ? "bg-green-500/20 text-green-400"
                                      : pagina.bounce_rate < 40
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {pagina.bounce_rate}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="aquisicao" className="space-y-6">
                {/* Traffic Sources */}
                <Card className="bg-gray-900/50 border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Fontes de Tráfego</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {fontesTrafegoData.map((fonte) => (
                          <div
                            key={fonte.fonte}
                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: fonte.cor }} />
                              <span className="text-white font-medium">{fonte.fonte}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{fonte.usuarios}</p>
                              <p className="text-gray-400 text-sm">{fonte.percentual}%</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={fontesTrafegoData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="usuarios"
                              label={({ nome, percentual }) => `${nome} ${percentual}%`}
                            >
                              {fontesTrafegoData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.cor} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tecnologia" className="space-y-6">
                {/* Devices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">Dispositivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dispositivosData.map((dispositivo) => (
                          <div
                            key={dispositivo.nome}
                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              {dispositivo.nome === "Desktop" && <Monitor className="w-5 h-5 text-purple-400" />}
                              {dispositivo.nome === "Mobile" && <Smartphone className="w-5 h-5 text-blue-400" />}
                              {dispositivo.nome === "Tablet" && <Monitor className="w-5 h-5 text-orange-400" />}
                              <span className="text-white font-medium">{dispositivo.nome}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{dispositivo.valor}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">Navegadores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { navegador: "Chrome", percentual: 65, usuarios: 1229 },
                          { navegador: "Safari", percentual: 18, usuarios: 340 },
                          { navegador: "Firefox", percentual: 10, usuarios: 189 },
                          { navegador: "Edge", percentual: 5, usuarios: 95 },
                          { navegador: "Outros", percentual: 2, usuarios: 38 },
                        ].map((item) => (
                          <div key={item.navegador} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white">{item.navegador}</span>
                              <span className="text-gray-400">
                                {item.percentual}% ({item.usuarios})
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div
                                className="h-2 bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${item.percentual}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
