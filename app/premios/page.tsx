"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Gift,
  Medal,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Lock,
  CheckCircle,
} from "lucide-react"

const conquistas = [
  {
    id: 1,
    nome: "Primeiro PIX",
    descricao: "Receba seu primeiro pagamento PIX",
    icone: Zap,
    pontos: 100,
    desbloqueada: true,
    progresso: 100,
    raridade: "comum",
    categoria: "iniciante",
  },
  {
    id: 2,
    nome: "Vendedor Estrela",
    descricao: "Alcance R$ 10.000 em vendas",
    icone: Star,
    pontos: 500,
    desbloqueada: true,
    progresso: 100,
    raridade: "raro",
    categoria: "vendas",
  },
  {
    id: 3,
    nome: "Rei do PIX",
    descricao: "Processe 1.000 transações PIX",
    icone: Crown,
    pontos: 1000,
    desbloqueada: false,
    progresso: 75,
    raridade: "épico",
    categoria: "transações",
  },
  {
    id: 4,
    nome: "Maratonista",
    descricao: "30 dias consecutivos com vendas",
    icone: Target,
    pontos: 750,
    desbloqueada: false,
    progresso: 60,
    raridade: "raro",
    categoria: "consistência",
  },
  {
    id: 5,
    nome: "Lenda",
    descricao: "Alcance R$ 100.000 em faturamento",
    icone: Trophy,
    pontos: 2500,
    desbloqueada: false,
    progresso: 25,
    raridade: "lendário",
    categoria: "faturamento",
  },
]

const recompensas = [
  {
    id: 1,
    nome: "Taxa Reduzida PIX",
    descricao: "50% de desconto nas taxas PIX por 30 dias",
    custo: 2000,
    icone: Zap,
    disponivel: true,
    categoria: "benefício",
  },
  {
    id: 2,
    nome: "Suporte Prioritário",
    descricao: "Atendimento VIP com resposta em até 1 hora",
    custo: 1500,
    icone: Crown,
    disponivel: true,
    categoria: "suporte",
  },
  {
    id: 3,
    nome: "Dashboard Premium",
    descricao: "Acesso a relatórios avançados e insights",
    custo: 3000,
    icone: TrendingUp,
    disponivel: false,
    categoria: "funcionalidade",
  },
  {
    id: 4,
    nome: "Cashback 2%",
    descricao: "2% de cashback em todas as transações por 60 dias",
    custo: 5000,
    icone: Gift,
    disponivel: false,
    categoria: "cashback",
  },
]

const desafios = [
  {
    id: 1,
    nome: "Sprint Semanal",
    descricao: "Processe R$ 5.000 esta semana",
    progresso: 3200,
    meta: 5000,
    recompensa: 300,
    prazo: "6 dias",
    ativo: true,
  },
  {
    id: 2,
    nome: "Mestre do PIX",
    descricao: "Realize 50 transações PIX este mês",
    progresso: 32,
    meta: 50,
    recompensa: 500,
    prazo: "15 dias",
    ativo: true,
  },
  {
    id: 3,
    nome: "Cliente Fiel",
    descricao: "Mantenha 10 clientes ativos por 30 dias",
    progresso: 7,
    meta: 10,
    recompensa: 750,
    prazo: "22 dias",
    ativo: true,
  },
]

const ranking = [
  { posicao: 1, nome: "João Silva", pontos: 15420, avatar: "🏆" },
  { posicao: 2, nome: "Maria Santos", pontos: 14890, avatar: "🥈" },
  { posicao: 3, nome: "Pedro Costa", pontos: 13750, avatar: "🥉" },
  { posicao: 4, nome: "Ana Oliveira", pontos: 12980, avatar: "⭐" },
  { posicao: 5, nome: "Carlos Lima", pontos: 11650, avatar: "💎" },
  { posicao: 12, nome: "Você", pontos: 8420, avatar: "👤", isUser: true },
]

export default function PremiosPage() {
  const [activeTab, setActiveTab] = useState("conquistas")
  const pontosUsuario = 8420
  const nivelAtual = Math.floor(pontosUsuario / 1000) + 1
  const pontosProximoNivel = nivelAtual * 1000 - pontosUsuario

  const getRaridadeColor = (raridade: string) => {
    switch (raridade) {
      case "comum":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "raro":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "épico":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "lendário":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
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
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Sistema de Prêmios
                  </h1>
                  <p className="text-gray-400">Conquiste badges, complete desafios e suba no ranking</p>
                </div>
              </div>
            </header>

            {/* Status do Usuário */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border-yellow-700/30 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-600/20 rounded-2xl">
                      <Trophy className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Pontos Totais</p>
                      <p className="text-3xl font-bold text-yellow-400">{pontosUsuario.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm border-purple-700/30 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-2xl">
                      <Star className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm font-medium">Nível Atual</p>
                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-bold text-purple-400">{nivelAtual}</p>
                        <div className="flex-1">
                          <Progress value={(pontosUsuario % 1000) / 10} className="h-2 bg-gray-800" />
                          <p className="text-xs text-gray-500 mt-1">{pontosProximoNivel} pontos para o próximo nível</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm border-green-700/30 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-2xl">
                      <Medal className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Posição no Ranking</p>
                      <p className="text-3xl font-bold text-green-400">#12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/50">
                <TabsTrigger
                  value="conquistas"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 rounded-xl transition-all duration-300"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Conquistas
                </TabsTrigger>
                <TabsTrigger
                  value="recompensas"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-300"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Recompensas
                </TabsTrigger>
                <TabsTrigger
                  value="desafios"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 rounded-xl transition-all duration-300"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Desafios
                </TabsTrigger>
                <TabsTrigger
                  value="ranking"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 rounded-xl transition-all duration-300"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ranking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="conquistas" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {conquistas.map((conquista) => (
                    <Card
                      key={conquista.id}
                      className={`bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                        conquista.desbloqueada ? "hover:shadow-lg hover:shadow-yellow-500/25" : "opacity-75"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-2xl ${
                              conquista.desbloqueada
                                ? "bg-yellow-600/20 border border-yellow-500/30"
                                : "bg-gray-700/20 border border-gray-600/30"
                            }`}
                          >
                            {conquista.desbloqueada ? (
                              <conquista.icone className="w-8 h-8 text-yellow-400" />
                            ) : (
                              <Lock className="w-8 h-8 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-semibold">{conquista.nome}</h3>
                              {conquista.desbloqueada && <CheckCircle className="w-4 h-4 text-green-400" />}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{conquista.descricao}</p>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge className={getRaridadeColor(conquista.raridade)}>{conquista.raridade}</Badge>
                                <span className="text-yellow-400 font-semibold">+{conquista.pontos} pts</span>
                              </div>

                              {!conquista.desbloqueada && (
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Progresso</span>
                                    <span className="text-white">{conquista.progresso}%</span>
                                  </div>
                                  <Progress value={conquista.progresso} className="h-2 bg-gray-800" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recompensas" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recompensas.map((recompensa) => (
                    <Card
                      key={recompensa.id}
                      className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
                            <recompensa.icone className="w-8 h-8 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2">{recompensa.nome}</h3>
                            <p className="text-gray-400 text-sm mb-4">{recompensa.descricao}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 font-semibold">
                                  {recompensa.custo.toLocaleString()} pontos
                                </span>
                              </div>

                              <Button
                                disabled={!recompensa.disponivel || pontosUsuario < recompensa.custo}
                                className={`rounded-xl ${
                                  recompensa.disponivel && pontosUsuario >= recompensa.custo
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                    : "bg-gray-700 cursor-not-allowed"
                                }`}
                              >
                                {pontosUsuario >= recompensa.custo ? "Resgatar" : "Insuficiente"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="desafios" className="space-y-6">
                <div className="space-y-4">
                  {desafios.map((desafio) => (
                    <Card
                      key={desafio.id}
                      className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{desafio.nome}</h3>
                            <p className="text-gray-400">{desafio.descricao}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-medium">{desafio.prazo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 font-semibold">+{desafio.recompensa} pts</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progresso</span>
                            <span className="text-white font-medium">
                              {typeof desafio.progresso === "number" && desafio.progresso > 100
                                ? desafio.progresso.toLocaleString()
                                : desafio.progresso}{" "}
                              /{" "}
                              {typeof desafio.meta === "number" && desafio.meta > 100
                                ? desafio.meta.toLocaleString()
                                : desafio.meta}
                            </span>
                          </div>
                          <Progress value={(desafio.progresso / desafio.meta) * 100} className="h-3 bg-gray-800" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ranking" className="space-y-6">
                <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      Ranking Global
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {ranking.map((usuario) => (
                        <div
                          key={usuario.posicao}
                          className={`flex items-center justify-between p-4 transition-all duration-300 ${
                            usuario.isUser
                              ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-l-4 border-purple-500"
                              : "hover:bg-gray-800/30"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                                usuario.posicao <= 3 ? "bg-gradient-to-r from-yellow-600 to-orange-600" : "bg-gray-700"
                              }`}
                            >
                              {usuario.posicao <= 3 ? usuario.avatar : usuario.posicao}
                            </div>
                            <div>
                              <p className={`font-semibold ${usuario.isUser ? "text-purple-400" : "text-white"}`}>
                                {usuario.nome}
                              </p>
                              <p className="text-gray-400 text-sm">#{usuario.posicao}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-yellow-400 font-bold">{usuario.pontos.toLocaleString()} pts</p>
                          </div>
                        </div>
                      ))}
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
