"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowRightLeft,
  Bell,
  Headphones,
  HelpCircle,
  Home,
  Settings,
  User,
  Sparkles,
  BarChart3,
  Send,
  Zap,
  Users,
  UserCircle,
  Award,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar className="border-r border-gray-800/50 bg-black/95 backdrop-blur-xl" collapsible="icon">
      {/* Header minimalista */}
      <SidebarHeader className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white tracking-tight">AURA</span>
                <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Dashboard</span>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
          {/* Perfil do usuário minimalista - SEM barra de progresso */}
          {!isCollapsed && (
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative cursor-pointer group">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-700">
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                        <Link href="/profile">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Meu Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                        <Link href="/premios">
                          <Award className="w-4 h-4 mr-2" />
                          Prêmios
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-red-400 focus:text-red-400">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div>
                    <span className="text-sm font-semibold text-white">montene...</span>
                    <p className="text-xs text-green-400">Online</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-800/50 rounded-lg relative">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
                </Button>
              </div>
            </div>
          )}

          {/* SEÇÃO PRINCIPAL */}
          <SidebarMenu className="space-y-2">
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                className="relative group bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 border border-purple-600/20 hover:border-purple-600/30 rounded-xl h-12 transition-all duration-300"
                tooltip={isCollapsed ? "Dashboard" : undefined}
              >
                <Link href="/">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <Home className="w-5 h-5" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">Dashboard</span>}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Separador */}
          <SidebarSeparator className="my-4" />

          {/* SEÇÃO FINANCEIRA */}
          <SidebarMenu className="space-y-2">
            {!isCollapsed ? (
              <>
                {/* Financeiro com submenu */}
                <SidebarMenuItem>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="financeiro" className="border-none">
                      <AccordionTrigger className="group text-gray-400 hover:no-underline hover:text-white hover:bg-gray-800/50 rounded-xl px-3 py-3 h-12 transition-all duration-300">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                            <ArrowRightLeft className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium">Financeiro</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-12 pt-2 space-y-1">
                        <Link
                          href="/financeiro/transacoes"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/financeiro/transacoes" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Transações
                        </Link>
                        <Link
                          href="/financeiro/extratos"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/financeiro/extratos" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Extratos
                        </Link>
                        <Link
                          href="/financeiro/conciliacao"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/financeiro/conciliacao" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Conciliação
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </SidebarMenuItem>

                {/* Relatórios com submenu */}
                <SidebarMenuItem>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="relatorios" className="border-none">
                      <AccordionTrigger className="group text-gray-400 hover:no-underline hover:text-white hover:bg-gray-800/50 rounded-xl px-3 py-3 h-12 transition-all duration-300">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium">Relatórios</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-12 pt-2 space-y-1">
                        <Link
                          href="/relatorios/vendas"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/relatorios/vendas" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Vendas
                        </Link>
                        <Link
                          href="/relatorios/financeiro"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/relatorios/financeiro" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Financeiro
                        </Link>
                        <Link
                          href="/relatorios/performance"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/relatorios/performance" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Performance
                        </Link>
                        <Link
                          href="/relatorios/analytics"
                          className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${pathname === "/relatorios/analytics" ? "text-white bg-gray-800/50" : "text-gray-500"}`}
                        >
                          Analytics
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </SidebarMenuItem>

                {/* Saques */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/saques"}
                    className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                  >
                    <Link href="/saques">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                          <Send className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">Saques</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Automatizações */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/automatizacoes"}
                    className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                  >
                    <Link href="/automatizacoes">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">Automatizações</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              <>
                {/* Versão colapsada */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/financeiro")}
                    className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                    tooltip="Financeiro"
                  >
                    <Link href="/financeiro/transacoes">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/relatorios")}
                    className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                    tooltip="Relatórios"
                  >
                    <Link href="/relatorios/vendas">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/saques"}
                    className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                    tooltip="Saques"
                  >
                    <Link href="/saques">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                        <Send className="w-5 h-5" />
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/automatizacoes"}
                    className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                    tooltip="Automatizações"
                  >
                    <Link href="/automatizacoes">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                        <Zap className="w-5 h-5" />
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>

          {/* Separador */}
          <SidebarSeparator className="my-4" />

          {/* SEÇÃO SUPORTE */}
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/suporte"}
                className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                tooltip={isCollapsed ? "Suporte" : undefined}
              >
                <Link href="/suporte">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                      <Headphones className="w-5 h-5" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">Suporte</span>}
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Dropdown do usuário quando collapsed */}
            {isCollapsed && (
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                      tooltip="Perfil"
                    >
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors relative">
                        <User className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-48 bg-gray-900 border-gray-700">
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                      <Link href="/profile">
                        <UserCircle className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                      <Link href="/premios">
                        <Award className="w-4 h-4 mr-2" />
                        Prêmios
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-red-400 focus:text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer com Ajuda e Configurações */}
      <SidebarFooter className="p-4 border-t border-gray-800/50">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/ajuda"}
              className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-10 rounded-xl transition-all duration-300"
              tooltip={isCollapsed ? "Ajuda" : undefined}
            >
              <Link href="/ajuda">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  {!isCollapsed && <span className="text-sm font-medium">Ajuda</span>}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-10 rounded-xl transition-all duration-300"
              tooltip={isCollapsed ? "Configurações" : undefined}
            >
              <Link href="/settings">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
