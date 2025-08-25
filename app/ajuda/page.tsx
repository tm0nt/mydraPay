"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { BookOpen, Video, Search, HelpCircle, Play, Clock, Eye, TrendingUp, Users, Star } from "lucide-react"

const ajudaStats = [
  { mes: "Jan", visualizacoes: 2450, artigos_lidos: 1890, videos_assistidos: 560, pesquisas: 340 },
  { mes: "Fev", visualizacoes: 2780, artigos_lidos: 2100, videos_assistidos: 680, pesquisas: 420 },
  { mes: "Mar", visualizacoes: 2340, artigos_lidos: 1780, videos_assistidos: 560, pesquisas: 380 },
  { mes: "Abr", visualizacoes: 3120, artigos_lidos: 2340, videos_assistidos: 780, pesquisas: 480 },
  { mes: "Mai", visualizacoes: 2890, artigos_lidos: 2180, videos_assistidos: 710, pesquisas: 450 },
  { mes: "Jun", visualizacoes: 3450, artigos_lidos: 2560, videos_assistidos: 890, pesquisas: 520 },
]

const categoriasPopulares = [
  { categoria: "PIX", artigos: 45, visualizacoes: 12500, cor: "#8B5CF6" },
  { categoria: "Conta", artigos: 32, visualizacoes: 8900, cor: "#06B6D4" },
  { categoria: "Segurança", artigos: 28, visualizacoes: 7600, cor: "#F59E0B" },
  { categoria: "Relatórios", artigos: 24, visualizacoes: 6200, cor: "#10B981" },
]

const artigosPopulares = [
  {
    id: "ART001",
    titulo: "Como fazer seu primeiro PIX",
    categoria: "PIX",
    visualizacoes: 2450,
    tempo_leitura: "3 min",
    avaliacao: 4.8,
    data_publicacao: new Date(2024, 0, 10),
    conteudo: "Guia completo para realizar transferências PIX de forma segura...",
  },
  {
    id: "ART002",
    titulo: "Configurando autenticação em duas etapas",
    categoria: "Segurança",
    visualizacoes: 1890,
    tempo_leitura: "5 min",
    avaliacao: 4.9,
    data_publicacao: new Date(2024, 0, 8),
    conteudo: "Aprenda a proteger sua conta com 2FA...",
  },
  {
    id: "ART003",
    titulo: "Entendendo as taxas da plataforma",
    categoria: "Conta",
    visualizacoes: 1650,
    tempo_leitura: "4 min",
    avaliacao: 4.6,
    data_publicacao: new Date(2024, 0, 5),
    conteudo: "Conheça todas as taxas aplicadas em cada operação...",
  },
]

const videosPopulares = [
  {
    id: "VID001",
    titulo: "Tutorial: Primeira configuração da conta",
    categoria: "Conta",
    duracao: "8:45",
    visualizacoes: 3200,
    avaliacao: 4.7,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Tutorial+Conta",
  },
  {
    id: "VID002",
    titulo: "Como usar o dashboard de forma eficiente",
    categoria: "Dashboard",
    duracao: "12:30",
    visualizacoes: 2800,
    avaliacao: 4.8,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Dashboard+Tutorial",
  },
  {
    id: "VID003",
    titulo: "Gerenciando automatizações",
    categoria: "Automatizações",
    duracao: "15:20",
    visualizacoes: 2100,
    avaliacao: 4.9,
    thumbnail: "/placeholder.svg?height=180&width=320&text=Automatizações",
  },
]

const faqItems = [
  {
    pergunta: "Como alterar minha senha?",
    resposta: "Vá em Configurações > Segurança > Alterar Senha. Digite sua senha atual e a nova senha duas vezes.",
    categoria: "Conta",
    visualizacoes: 1250,
    util: 95,
  },
  {
    pergunta: "Qual o limite diário para PIX?",
    resposta: "O limite padrão é R$ 5.000 por dia. Você pode solicitar aumento através do suporte.",
    categoria: "PIX",
    visualizacoes: 890,
    util: 88,
  },
  {
    pergunta: "Como gerar relatórios personalizados?",
    resposta: "Acesse Relatórios > Criar Novo > Selecione os filtros desejados > Gerar Relatório.",
    categoria: "Relatórios",
    visualizacoes: 567,
    util: 92,
  },
]

export default function AjudaPage() {
  const [activeTab, setActiveTab] = useState("artigos")
  const [searchTerm, setSearchTerm] = useState("")

  const totalVisualizacoes = ajudaStats[ajudaStats.length - 1].visualizacoes
  const totalArtigos = ajudaStats[ajudaStats.length - 1].artigos_lidos
  const totalVideos = ajudaStats[ajudaStats.length - 1].videos_assistidos
  const totalPesquisas = ajudaStats[ajudaStats.length - 1].pesquisas

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Central de Ajuda</h1>
                  <p className="text-gray-400">Guias, tutoriais e documentação completa</p>
                </div>
              </div>
            </header>

            {/* Search */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Pesquisar artigos, vídeos ou perguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-gray-800/50 border-gray-700/50 text-white text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Visualizações</p>
                      <p className="text-2xl font-bold text-white">{totalVisualizacoes.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+19.4%</span>
                      </div>
                    </div>
                    <Eye className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Artigos Lidos</p>
                      <p className="text-2xl font-bold text-white">{totalArtigos.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+17.5%</span>
                      </div>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Vídeos Assistidos</p>
                      <p className="text-2xl font-bold text-white">{totalVideos.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+25.2%</span>
                      </div>
                    </div>
                    <Video className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pesquisas</p>
                      <p className="text-2xl font-bold text-white">{totalPesquisas.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+15.6%</span>
                      </div>
                    </div>
                    <Search className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Chart */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Uso da Central de Ajuda</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={ajudaStats}>
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
                      dataKey="visualizacoes"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#8B5CF6", strokeWidth: 2 }}
                      name="Visualizações"
                    />
                    <Line
                      type="monotone"
                      dataKey="artigos_lidos"
                      stroke="#06B6D4"
                      strokeWidth={3}
                      dot={{ fill: "#06B6D4", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#06B6D4", strokeWidth: 2 }}
                      name="Artigos"
                    />
                    <Line
                      type="monotone"
                      dataKey="videos_assistidos"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2 }}
                      name="Vídeos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Categories Chart */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Categorias Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoriasPopulares}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="categoria" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="visualizacoes" fill="#8B5CF6" name="Visualizações" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="artigos" className="data-[state=active]:bg-purple-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Artigos
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-purple-600">
                  <Video className="w-4 h-4 mr-2" />
                  Vídeos
                </TabsTrigger>
                <TabsTrigger value="faq" className="data-[state=active]:bg-purple-600">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="artigos" className="space-y-6">
                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artigosPopulares.map((artigo) => (
                    <Card
                      key={artigo.id}
                      className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-purple-500/20 text-purple-400">{artigo.categoria}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 text-sm">{artigo.avaliacao}</span>
                          </div>
                        </div>

                        <h3 className="text-white font-semibold text-lg mb-2">{artigo.titulo}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{artigo.conteudo}</p>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{artigo.tempo_leitura}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{artigo.visualizacoes}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videosPopulares.map((video) => (
                    <Card
                      key={video.id}
                      className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={video.thumbnail || "/placeholder.svg"}
                            alt={video.titulo}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-lg">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded">
                            {video.duracao}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className="bg-blue-500/20 text-blue-400">{video.categoria}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-yellow-400 text-sm">{video.avaliacao}</span>
                            </div>
                          </div>

                          <h3 className="text-white font-semibold text-lg mb-2">{video.titulo}</h3>

                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span>{video.visualizacoes.toLocaleString()} visualizações</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                {/* FAQ Items */}
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <Card key={index} className="bg-gray-900/50 border-gray-800/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-semibold text-lg">{item.pergunta}</h3>
                          <Badge className="bg-green-500/20 text-green-400">{item.categoria}</Badge>
                        </div>

                        <p className="text-gray-300 mb-4">{item.resposta}</p>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{item.visualizacoes} visualizações</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{item.util}% achou útil</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                            >
                              👍 Útil
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-700/50 hover:bg-gray-800/50 bg-transparent"
                            >
                              👎 Não útil
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
