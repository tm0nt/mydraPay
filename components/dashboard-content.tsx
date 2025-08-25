"use client"

import {
  BarChart3,
  Calendar,
  ChevronRight,
  Code,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  History,
  LineChart,
  Lock,
  Moon,
  Bell,
  QrCode,
  Send,
  TrendingUp,
  User,
  Wallet,
  ArrowRightLeft,
  Target,
  DollarSign,
  Zap,
  LogOut,
  Award,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BillingChart } from "@/components/billing-chart"
import { SidebarTrigger } from "./ui/sidebar"
import { GerarPixModal } from "./modals/gerar-pix-modal"
import { SolicitarSaqueModal } from "./modals/solicitar-saque-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useDashboardData } from "@/hooks/use-dashboard-data"

const DashboardContent = () => {
  const [valuesHidden, setValuesHidden] = useState(false)
  const [gerarPixOpen, setGerarPixOpen] = useState(false)
  const [solicitarSaqueOpen, setSolicitarSaqueOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { stats, transactions, notifications, loading, error, markNotificationAsRead, markAllNotificationsAsRead } =
    useDashboardData()

  const safeNotifications = Array.isArray(notifications) ? notifications : []
  const unreadCount = safeNotifications.filter(n => !n.read).length

  const statCards = stats
    ? [
        {
          title: "Saldo Disponível",
          amount: `R$ ${stats.availableBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "Saldo disponível para saque",
          icon: Wallet,
          trend: "+15.2%",
          trendUp: true,
          color: "emerald",
        },
        {
          title: "Recebido Hoje",
          amount: `R$ ${stats.todayRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "Total faturado no dia",
          icon: TrendingUp,
          trend: "+8.5%",
          trendUp: true,
          color: "blue",
        },
        {
          title: "Bloqueio Cautelar",
          amount: `R$ ${stats.blockedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "MEDs em disputa",
          icon: Lock,
          trend: "0%",
          trendUp: false,
          color: "orange",
        },
        {
          title: "Faturamento Total",
          amount: `R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "Valor total de vendas",
          icon: DollarSign,
          trend: "+23.8%",
          trendUp: true,
          color: "purple",
        },
      ]
    : []

  const conversionData = stats
    ? [
        { title: "Conversão Geral", icon: Target, value: Math.round(stats.conversionRates.general), color: "cyan" },
        { title: "Pix", icon: Zap, value: Math.round(stats.conversionRates.pix), color: "green" },
        { title: "Cartão de Crédito", icon: CreditCard, value: Math.round(stats.conversionRates.creditCard), color: "blue" },
        { title: "Boleto", icon: FileText, value: Math.round(stats.conversionRates.boleto), color: "orange" },
        { title: "Taxa de estorno", icon: TrendingUp, value: Math.round(stats.conversionRates.chargebackRate), color: "red", isReversed: true },
      ]
    : []

  const bottomStatCards = stats
    ? [
        {
          title: "Saldo a Receber",
          amount: `R$ ${stats.pendingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "Lançamentos futuros",
          icon: Wallet,
          color: "teal",
        },
        {
          title: "Ticket Médio",
          amount: `R$ ${stats.averageTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "Valor médio por venda",
          icon: LineChart,
          color: "violet",
        },
        {
          title: "Média diária",
          amount: `R$ ${stats.dailyAverage.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          description: "Faturamento médio diário",
          icon: BarChart3,
          color: "rose",
        },
        {
          title: "Quantidade de Transações",
          amount: stats.transactionCount.toLocaleString("pt-BR"),
          description: "Total de vendas aprovadas",
          icon: ArrowRightLeft,
          color: "amber",
        },
      ]
    : []

  const maskValue = (value: string) => {
    if (!valuesHidden) return value
    return value.replace(/[0-9]/g, "*").replace(/[.,]/g, "*")
  }

  const formatDateRange = () => {
    if (!dateRange.from) return "Selecionar período"
    if (!dateRange.to) return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
  }

  const actionButtons = [
    { title: "Gerar PIX", description: "QR Code para receber", icon: QrCode, color: "cyan", onClick: () => setGerarPixOpen(true) },
    { title: "Solicitar Saque", description: "Transferir via PIX", icon: Send, color: "green", onClick: () => setSolicitarSaqueOpen(true) },
    { title: "Transações", description: "Ver histórico", icon: History, color: "indigo", href: "/financeiro/transacoes" },
    { title: "Credenciais API", description: "Gerencie suas credenciais", icon: Code, color: "pink", href: "/settings?tab=api" },
  ]

  if (loading) {
    return (
      <main className="flex-1 min-h-screen bg-black overflow-auto">
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-400">Carregando dados do dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 min-h-screen bg-black overflow-auto">
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-red-400 text-lg">Erro ao carregar dados</div>
              <p className="text-gray-400">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 min-h-screen bg-black overflow-auto">
      <div className="p-6 md:p-8 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl border border-gray-800/50 bg-gray-900/50" />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Bem-vindo, 61.739.177</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl"
                onClick={() => setValuesHidden(!valuesHidden)}
              >
                {valuesHidden ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/50 hover:border-gray-700/50 rounded-xl px-4 py-2 h-10">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="max-w-[200px] truncate text-gray-300 text-sm font-medium">{formatDateRange()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black/95 border border-gray-800/50 rounded-xl overflow-hidden" align="end" sideOffset={8}>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white text-lg">Período de Análise</h4>
                    <p className="text-sm text-gray-400">Selecione o intervalo de datas</p>
                  </div>

                  <CalendarComponent
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    className="rounded-xl border-gray-800/50 bg-gray-900/30"
                  />

                  <div className="flex gap-3 pt-2">
                    <Button size="sm" onClick={() => setCalendarOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-2">
                      Aplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDateRange({ from: new Date(2024, 0, 1), to: new Date() })
                        setCalendarOpen(false)
                      }}
                      className="border-gray-800/50 hover:bg-gray-800/50 text-gray-300 hover:text-white rounded-xl px-6 py-2"
                    >
                      Resetar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="bg-purple-600/20 border border-purple-600/30 rounded-xl px-4 py-2 text-sm font-medium text-purple-300">
              {maskValue(`R$ ${(stats?.totalRevenue || 0).toLocaleString("pt-BR")}K / R$ 120.0K`)}
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl">
                <Moon className="h-5 w-5 text-gray-400" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl relative">
                    <Bell className="h-5 w-5 text-gray-400" />
                    {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-black/95 border border-gray-800/50 rounded-xl p-0 overflow-hidden" sideOffset={8}>
                  <div className="p-4 border-b border-gray-800/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notificações</h3>
                      <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30 text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </Badge>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto scrollbar-hide">
                    {safeNotifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Nenhuma notificação</div>
                    ) : (
                      safeNotifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="p-4 cursor-pointer hover:bg-gray-800/50 border-b border-gray-800/30 last:border-b-0"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? "bg-purple-500" : "bg-gray-600"}`} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${!notification.read ? "text-white" : "text-gray-300"}`}>
                                  {notification.title}
                                </p>
                                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                                  {format(new Date(notification.createdAt), "HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{notification.description}</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-800/50">
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-purple-400 hover:text-purple-300 hover:bg-gray-800/50 rounded-xl py-2"
                      onClick={markAllNotificationsAsRead}
                    >
                      Marcar todas como lidas
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl relative">
                    <User className="h-5 w-5 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-black/95 border border-gray-800/50 rounded-xl p-0 overflow-hidden" sideOffset={8}>
                  <div className="p-4 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">montene...</h3>
                        <p className="text-xs text-green-400">Online</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progresso</span>
                        <span className="text-white font-medium">60%</span>
                      </div>
                      <Progress value={60} className="h-2 bg-gray-800" />
                    </div>
                  </div>

                  <div className="p-1">
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800/50 rounded-xl p-3">
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-white font-medium">Meu Perfil</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800/50 rounded-xl p-3">
                      <Link href="/premios">
                        <Award className="w-4 h-4 mr-3 text-gray-400" />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white font-medium">Ranking</span>
                          <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30 text-xs px-2 py-1">#12</Badge>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800/50 rounded-xl p-3">
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-white font-medium">Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-gray-800/50 mx-2" />

                  <div className="p-1">
                    <DropdownMenuItem className="cursor-pointer hover:bg-red-500/10 rounded-xl p-3">
                      <LogOut className="w-4 h-4 mr-3 text-red-400" />
                      <span className="text-red-400 font-medium">Sair</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <Card
              key={card.title}
              className="group bg-gray-900/50 border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms`, animation: "fadeInUp 0.6s ease-out forwards" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300">{card.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${card.trendUp ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                      {card.trend}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-xl group-hover:scale-110">
                  <card.icon className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-white group-hover:text-white/90">{maskValue(card.amount)}</div>
                <p className="text-xs text-gray-500 group-hover:text-gray-400">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Gerar PIX", description: "QR Code para receber", icon: QrCode, onClick: () => setGerarPixOpen(true) },
            { title: "Solicitar Saque", description: "Transferir via PIX", icon: Send, onClick: () => setSolicitarSaqueOpen(true) },
            { title: "Transações", description: "Ver histórico", icon: History, href: "/financeiro/transacoes" },
            { title: "Credenciais API", description: "Gerencie suas credenciais", icon: Code, href: "/settings?tab=api" },
          ].map((button, index) => {
            const ButtonComponent: any = (button as any).href ? Link : "button"
            const buttonProps: any = (button as any).href ? { href: (button as any).href } : { onClick: (button as any).onClick }
            return (
              <ButtonComponent
                key={button.title}
                {...buttonProps}
                className="group h-auto bg-gray-900/50 border-gray-800/50 hover:border-gray-700/50 hover:bg-gray-800/50 justify-between p-6 rounded-xl border flex items-center text-left"
                style={{ animationDelay: `${(index + 4) * 100}ms`, animation: "fadeInUp 0.6s ease-out forwards" }}
              >
                <div className="text-left space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-800/50 rounded-lg group-hover:scale-110">
                      <button.icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="font-semibold text-white group-hover:text-white/90">{button.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors ml-10">{button.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
              </ButtonComponent>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800/50 hover:border-gray-700/50 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <CardTitle className="text-white text-xl font-semibold">Faturamento</CardTitle>
              </div>
              <p className="text-sm text-gray-400">Análise completa de entradas e saídas com controles de período.</p>
            </CardHeader>
            <CardContent className="p-6">
              <BillingChart />
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800/50 hover:border-gray-700/50 group">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <CardTitle className="text-white text-xl font-semibold">Conversão</CardTitle>
              </div>
              <p className="text-sm text-gray-400">Relação entre pagamentos gerados e concluídos.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {conversionData.map((item, index) => (
                <div key={item.title} className="group/item" style={{ animationDelay: `${index * 150}ms`, animation: "fadeInLeft 0.6s ease-out forwards" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover/item:scale-110">
                        <item.icon className="h-4 w-4 text-gray-400" style={{ transform: (item as any).isReversed ? "scaleY(-1)" : "none" }} />
                      </div>
                      <span className="text-gray-300 group-hover/item:text-white">{item.title}</span>
                    </div>
                    <span className="text-sm font-semibold text-white bg-gray-800/50 px-2 py-1 rounded-md">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${item.value}%`, animationDelay: `${index * 200 + 500}ms` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bottomStatCards.map((card, index) => (
            <Card
              key={card.title}
              className="group bg-gray-900/50 border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 100 + 800}ms`, animation: "fadeInUp 0.6s ease-out forwards" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300">{card.title}</CardTitle>
                <div className="p-3 bg-gray-800/50 rounded-xl group-hover:scale-110">
                  <card.icon className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-white group-hover:text-white/90">{maskValue(card.amount)}</div>
                <p className="text-xs text-gray-500 group-hover:text-gray-400">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <GerarPixModal open={gerarPixOpen} onOpenChange={setGerarPixOpen} />
      <SolicitarSaqueModal open={solicitarSaqueOpen} onOpenChange={setSolicitarSaqueOpen} />

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </main>
  )
}

export { DashboardContent }
