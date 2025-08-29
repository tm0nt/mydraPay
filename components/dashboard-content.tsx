"use client";

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
  Settings,
  RotateCcw,
  X,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingChart } from "@/components/billing-chart";
import { SidebarTrigger } from "./ui/sidebar";
import { GerarPixModal } from "./modals/gerar-pix-modal";
import { SolicitarSaqueModal } from "./modals/solicitar-saque-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useUserStore } from "@/stores/useProfileStore";

export function DashboardContent() {
  // Dados do store
  const { data, error, fetchProfile } = useUserStore();

  const [valuesHidden, setValuesHidden] = useState(false);
  const [gerarPixOpen, setGerarPixOpen] = useState(false);
  const [solicitarSaqueOpen, setSolicitarSaqueOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Estados para notificações da API
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Função de logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true
      });
    } catch (error) {
      console.error("Erro no logout:", error);
      setIsLoggingOut(false);
    }
  };

  // Busca notificações da API
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const { notifications, unreadCount } = await res.json();
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Marca uma notificação como lida
  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  // Marca todas as notificações como lidas
  const markAllNotificationsAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  const maskValue = (value: string) => {
    if (!valuesHidden) return value;
    return value.replace(/[0-9]/g, "*").replace(/[.,]/g, "*");
  };

  const formatDateRange = () => {
    if (!dateRange.from) return "Selecionar período";
    if (!dateRange.to) return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  const actionButtons = [
    {
      title: "Gerar PIX",
      description: "QR Code para receber",
      icon: QrCode,
      color: "cyan",
      onClick: () => setGerarPixOpen(true),
    },
    {
      title: "Solicitar Saque",
      description: "Transferir via PIX",
      icon: Send,
      color: "green",
      onClick: () => setSolicitarSaqueOpen(true),
    },
    {
      title: "Transações",
      description: "Ver histórico",
      icon: History,
      color: "indigo",
      href: "/financeiro/transacoes",
    },
    {
      title: "Credenciais API",
      description: "Gerencie suas credenciais",
      icon: Code,
      color: "pink",
      href: "/settings?tab=api",
    },
  ];

  // Cards de estatísticas principais (ATUALIZADOS com dados corretos)
  const statCards = useMemo(() => {
    return [
      {
        title: "Saldo Disponível",
        amount: `R$ ${(data?.balance?.current ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "Saldo disponível para saque",
        icon: Wallet,
        color: "emerald",
      },
      {
        title: "Recebido Hoje",
        amount: `R$ ${(data?.incomingStats?.todayIncomingAmount ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "Total faturado no dia",
        icon: TrendingUp,
        color: "blue",
      },
      {
        title: "Bloqueio Cautelar",
        amount: `R$ ${(data?.balance?.blocked ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "MEDs em disputa",
        icon: Lock,
        color: "orange",
      },
      {
        title: "Faturamento Total",
        amount: `R$ ${(data?.incomingStats?.totalIncomingAmount ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "Valor total de vendas",
        icon: DollarSign,
        color: "purple",
      },
    ];
  }, [data]);

  // Cards de conversão (usando conversionRates do store)
  const conversionData = useMemo(() => {
    return [
      { title: "Conversão Geral", icon: Target, value: data?.conversionRates?.general ?? 0, color: "cyan" },
      { title: "Pix", icon: Zap, value: data?.conversionRates?.pix ?? 0, color: "green" },
      { title: "Cartão de Crédito", icon: CreditCard, value: data?.conversionRates?.creditCard ?? 0, color: "blue" },
      { title: "Boleto", icon: FileText, value: data?.conversionRates?.boleto ?? 0, color: "orange" },
      { title: "Taxa de estorno", icon: TrendingUp, value: data?.conversionRates?.chargebackRate ?? 0, color: "red", isReversed: true },
    ];
  }, [data]);

  // Cards inferiores (ATUALIZADOS com dados corretos)
  const bottomStatCards = useMemo(() => {
    return [
      {
        title: "Saldo a Receber",
        amount: `R$ ${(data?.balance?.pending ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "Lançamentos futuros",
        icon: Wallet,
        color: "teal",
      },
      {
        title: "Ticket Médio",
        amount: `R$ ${((data?.incomingStats?.totalIncomingAmount ?? 0) / Math.max(1, data?.incomingStats?.totalIncomingCompleted ?? 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "Valor médio por venda",
        icon: LineChart,
        color: "violet",
      },
      {
        title: "Média diária",
        amount: `R$ ${((data?.incomingStats?.totalIncomingAmount ?? 0) / 30).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        description: "Faturamento médio diário",
        icon: BarChart3,
        color: "rose",
      },
      {
        title: "Quantidade de Transações",
        amount: (data?.incomingStats?.totalIncomingCompleted ?? 0).toLocaleString("pt-BR"),
        description: "Total de vendas aprovadas",
        icon: ArrowRightLeft,
        color: "amber",
      },
    ];
  }, [data]);

  // Limitação de notificações no dropdown (máximo 6)
  const limitedNotifications = notifications.slice(0, 6);

  // Erro
  if (error) {
    return (
      <main className="flex-1 min-h-screen bg-black overflow-auto">
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 animate-fadeInUp">
              <div className="text-red-400 text-lg">Erro ao carregar dados</div>
              <p className="text-gray-400">{error}</p> 
              <Button
                onClick={fetchProfile}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Conteúdo principal
  const displayName = data?.user?.name || "Usuário";

  return (
    <main className="flex-1 min-h-screen bg-black overflow-auto">
      <div className="p-6 md:p-8 space-y-8">
        <header className="flex items-center justify-between animate-fadeInUp">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl border border-gray-800/50 bg-gray-900/50 hover:scale-105" />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Bem-vindo, {displayName}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl hover:scale-110"
                onClick={() => setValuesHidden(!valuesHidden)}
              >
                {valuesHidden ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-800/50 hover:border-gray-700/50 rounded-xl px-4 py-2 h-10"
                >
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="max-w-[200px] truncate text-gray-300 text-sm font-medium">{formatDateRange()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-black/95 border border-gray-800/50 rounded-xl overflow-hidden"
                align="end"
                sideOffset={8}
              >
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
                    <Button
                      size="sm"
                      onClick={() => setCalendarOpen(false)}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-2"
                    >
                      Aplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDateRange({ from: new Date(2024, 0, 1), to: new Date() });
                        setCalendarOpen(false);
                      }}
                      className="border-gray-800/50 hover:bg-gray-800/50 text-gray-300 hover:text-white rounded-xl px-6 py-2"
                    >
                      Resetar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1">
              {/* DROPDOWN DE NOTIFICAÇÕES COM LIMITE DE 6 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-800/50 rounded-xl relative">
                    <Bell className="h-5 w-5 text-gray-400" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {unreadCount > 6 ? "6+" : unreadCount}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 bg-black/95 border border-gray-800/50 rounded-xl p-0 overflow-hidden"
                  sideOffset={8}
                >
                  <div className="p-4 border-b border-gray-800/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notificações</h3>
                      <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30 text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </Badge>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto scrollbar-hide">
                    {limitedNotifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Nenhuma notificação</div>
                    ) : (
                      limitedNotifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="p-4 cursor-pointer hover:bg-gray-800/50 border-b border-gray-800/30 last:border-b-0"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? "bg-purple-500" : "bg-gray-600"}`} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${!notification.isRead ? "text-white" : "text-gray-300"}`}>
                                  {notification.title}
                                </p>
                                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                                  {format(new Date(notification.createdAt), "HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                              {notification.description && (
                                <p className="text-xs text-gray-400 leading-relaxed">{notification.description}</p>
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-800/50 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl py-2"
                      onClick={() => setNotificationModalOpen(true)}
                    >
                      Ver todas
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
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-black/95 border border-gray-800/50 rounded-xl p-0 overflow-hidden"
                  sideOffset={8}
                >
                  <div className="p-4 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center">
                          <Image 
                            src="/avatar/profile.png" 
                            alt="Profile Avatar"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{displayName}</h3>
                        <p className="text-xs text-green-400">Online</p>
                      </div>
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
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-white font-medium">Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-gray-800/50 mx-2" />

                  <div className="p-1">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-red-500/10 rounded-xl p-3"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <RotateCcw className="w-4 h-4 mr-3 text-red-400 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4 mr-3 text-red-400" />
                      )}
                      <span className="text-red-400 font-medium">
                        {isLoggingOut ? "Saindo..." : "Sair"}
                      </span>
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
              className="group bg-gray-900/50 border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-2 cursor-pointer animate-fadeInUp hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {card.title}
                  </CardTitle>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-600/20">
                  <card.icon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                  {maskValue(card.amount)}
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionButtons.map((button, index) => {
            const ButtonComponent: any = button.href ? Link : "button";
            const buttonProps: any = button.href
              ? { href: button.href }
              : { onClick: button.onClick };
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
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors ml-10">
                    {button.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
              </ButtonComponent>
            );
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
                <div
                  key={item.title}
                  className="group/item"
                  style={{ animationDelay: `${index * 150}ms`, animation: "fadeInLeft 0.6s ease-out forwards" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover/item:scale-110">
                        <item.icon
                          className="h-4 w-4 text-gray-400"
                          style={{ transform: item.isReversed ? "scaleY(-1)" : "none" }}
                        />
                      </div>
                      <span className="text-gray-300 group-hover/item:text-white">{item.title}</span>
                    </div>
                    <span className="text-sm font-semibold text-white bg-gray-800/50 px-2 py-1 rounded-md">
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.value}%`, animationDelay: `${index * 200 + 500}ms` }}
                    />
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
                <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                  {card.title}
                </CardTitle>
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

      {/* MODAL COMPLETO DE NOTIFICAÇÕES */}
      <Dialog open={notificationModalOpen} onOpenChange={setNotificationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-black border border-gray-800/50">
          <DialogHeader className="border-b border-gray-800/50 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-white">
                Todas as Notificações
              </DialogTitle>
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                  {notifications.length} total
                </Badge>
                <Button
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300 hover:bg-gray-800/50 text-sm"
                  onClick={markAllNotificationsAsRead}
                >
                  Marcar todas como lidas
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma notificação encontrada</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-gray-800/30 ${
                    !notification.isRead 
                      ? "bg-gray-800/50 border-purple-600/30" 
                      : "bg-gray-900/30 border-gray-800/50"
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${!notification.isRead ? "bg-purple-500" : "bg-gray-600"}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${!notification.isRead ? "text-white" : "text-gray-300"}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs">
                              Nova
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                            {format(new Date(notification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      {notification.description && (
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {notification.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <GerarPixModal open={gerarPixOpen} onOpenChange={setGerarPixOpen} />
      <SolicitarSaqueModal open={solicitarSaqueOpen} onOpenChange={setSolicitarSaqueOpen} />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
