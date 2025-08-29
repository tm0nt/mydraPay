"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import {
  ArrowRightLeft,
  BarChart3,
  Calendar,
  Headphones,
  HelpCircle,
  Home,
  Settings,
  Send,
  User,
  UserCircle,
  Award,
  LogOut,
  Phone,
  Mail,
  Users,
  MessageCircle,
  AlertTriangle,
} from "lucide-react"

import { GerarPixModal } from "@/components/modals/gerar-pix-modal"
import { SolicitarSaqueModal } from "@/components/modals/solicitar-saque-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUserStore } from "@/stores/useProfileStore" // Import do store

export function AppSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()
  const isCollapsed = state === "collapsed"

  // Dados do store
  const { data } = useUserStore()

  // Estados dos modais
  const [openPix, setOpenPix] = useState(false)
  const [openSaque, setOpenSaque] = useState(false)
  const [openSupport, setOpenSupport] = useState(false)

  // Dados de suporte vindos do globalConfig
  const supportData = {
    contactEmail: data?.globalConfig?.contactEmail || "suporte@empresa.com",
    whatsappNumber: data?.globalConfig?.whatsappNumber || "5511999999999",
    whatsappGroupLink: data?.globalConfig?.whatsappGroupLink || "#",
    siteName: data?.globalConfig?.siteName || "Empresa",
  }

  // Status KYC do usuário
  const kycApproved = data?.user?.kycApproved ?? false

  return (
    <>
      <Sidebar className="border-r border-gray-800/50 bg-black/95 backdrop-blur-xl" collapsible="icon">
        {/* Header minimalista */}
        <SidebarHeader className="p-6 border-b border-gray-800/50">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              {!isCollapsed && (
                <div className="flex flex-col">
                  <Image
                    src="/logo-mydra.png"
                    width={150}
                    height={30}
                    alt={`Logo ${supportData.siteName}`}
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col h-full">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
            
            {/* MENSAGEM KYC - Aparece apenas se não aprovado */}
            {!kycApproved && (
              <div className={`bg-amber-800/20 border border-amber-600/30 text-amber-100 p-3 rounded-xl space-y-3 ${isCollapsed ? 'p-2' : ''}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  {!isCollapsed && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Verificação KYC</p>
                      <Button 
                        asChild 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700 text-amber-50 h-8 text-xs"
                      >
                        <Link href="/profile">
                          Enviar Documentos
                        </Link>
                      </Button>
                    </div>
                  )}
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

            {/* SEÇÃO FINANCEIRA + RELATÓRIOS */}
            <SidebarMenu className="space-y-2">
              {!isCollapsed ? (
                <>
                  {/* Financeiro com ações (abrindo modais) */}
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
                          <button
                            onClick={() => setOpenPix(true)}
                            className="w-full text-left block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 text-gray-500"
                          >
                            Enviar (QR Code)
                          </button>
                          <button
                            onClick={() => setOpenSaque(true)}
                            className="w-full text-left block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 text-gray-500"
                          >
                            Receber (Saque)
                          </button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </SidebarMenuItem>

                  {/* Relatórios */}
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
                            href="/relatorios/extrato"
                            className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${
                              pathname === "/relatorios/extrato" ? "text-white bg-gray-800/50" : "text-gray-500"
                            }`}
                          >
                            Extrato
                          </Link>
                          <Link
                            href="/relatorios/transacoes"
                            className={`block py-2 px-3 rounded-lg hover:text-white hover:bg-gray-800/50 text-sm transition-all duration-200 ${
                              pathname === "/relatorios/transacoes" ? "text-white bg-gray-800/50" : "text-gray-500"
                            }`}
                          >
                            Transações
                          </Link>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </SidebarMenuItem>
                </>
              ) : (
                <>
                  {/* Versão colapsada */}
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                          tooltip="Financeiro"
                        >
                          <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                            <ArrowRightLeft className="w-5 h-5" />
                          </div>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-44 bg-gray-900 border-gray-700">
                        <DropdownMenuItem
                          onClick={() => setOpenPix(true)}
                          className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                        >
                          Enviar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setOpenSaque(true)}
                          className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                        >
                          Receber 
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>

                  {/* Relatórios (dropdown) */}
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                          className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                          tooltip="Relatórios"
                        >
                          <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-48 bg-gray-900 border-gray-700">
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                          <Link href="/relatorios/extrato">Extrato</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                          <Link href="/relatorios/transacoes">Transações</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>

            {/* Separador */}
            <SidebarSeparator className="my-4" />

            <SidebarMenu className="space-y-2">
              {/* Perfil */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/profile"}
                  className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                  tooltip={isCollapsed ? "Perfil" : undefined}
                >
                  <Link href="/profile">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      {!isCollapsed && <span className="text-sm font-medium">Perfil</span>}
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Suporte abre modal */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenSupport(true)}
                  isActive={false}
                  className="group text-gray-400 hover:text-white hover:bg-gray-800/50 h-12 rounded-xl transition-all duration-300"
                  tooltip={isCollapsed ? "Suporte" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                      <Headphones className="w-5 h-5" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">Suporte</span>}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="p-4 border-t border-gray-800/50">
          <SidebarMenu className="space-y-2">
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

      {/* Modais acionados pelo sidebar */}
      <GerarPixModal open={openPix} onOpenChange={setOpenPix} />
      <SolicitarSaqueModal open={openSaque} onOpenChange={setOpenSaque} />
      <SupportModal 
        open={openSupport} 
        onOpenChange={setOpenSupport} 
        supportData={supportData}
      />
    </>
  )
}

/* Modal de Suporte atualizado com dados do store */
function SupportModal({
  open,
  onOpenChange,
  supportData,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  supportData: {
    contactEmail: string
    whatsappNumber: string
    whatsappGroupLink: string
    siteName: string
  }
}) {
  const formatWhatsAppLink = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=Olá! Preciso de ajuda com minha conta na ${supportData.siteName}.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black text-white border border-gray-800 w-full max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Suporte e Contato</DialogTitle>
          <p className="text-sm text-gray-400">Entre em contato conosco através dos canais abaixo</p>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* E-mail de contato */}
          <a
            href={`mailto:${supportData.contactEmail}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:bg-gray-900/50 transition-colors group"
          >
            <Users className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
            <div>
              <p className="text-sm font-medium">Gerente de Contas</p>
              <p className="text-xs text-gray-400">{supportData.contactEmail}</p>
            </div>
          </a>

          {/* WhatsApp direto */}
          <a
            href={formatWhatsAppLink(supportData.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:bg-gray-900/50 transition-colors group"
          >
            <MessageCircle className="w-5 h-5 text-green-400 group-hover:text-green-300" />
            <div>
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-gray-400">Suporte direto</p>
            </div>
          </a>

          {/* Grupo WhatsApp */}
          <a
            href={supportData.whatsappGroupLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:bg-gray-900/50 transition-colors group"
          >
            <Users className="w-5 h-5 text-green-400 group-hover:text-green-300" />
            <div>
              <p className="text-sm font-medium">Grupo WhatsApp</p>
              <p className="text-xs text-gray-400">Comunidade de usuários</p>
            </div>
          </a>

          {/* Central de Ajuda */}
          <Link
            href="/ajuda"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:bg-gray-900/50 transition-colors group"
          >
            <HelpCircle className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
            <div>
              <p className="text-sm font-medium">Central de Ajuda</p>
              <p className="text-xs text-gray-400">FAQ, guias e tutoriais</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-400 p-3 bg-gray-900/30 rounded-lg">
          <Phone className="w-4 h-4" />
          <span>Respondemos em até 24h nos dias úteis</span>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => onOpenChange(false)} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
