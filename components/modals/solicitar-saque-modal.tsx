"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Bitcoin, AlertCircle, CheckCircle, QrCode, Wallet, TrendingUp } from "lucide-react"

interface SolicitarSaqueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SolicitarSaqueModal({ open, onOpenChange }: SolicitarSaqueModalProps) {
  const [activeTab, setActiveTab] = useState("pix")
  const [pixForm, setPixForm] = useState({
    valor: "",
    chavePix: "",
  })
  const [cryptoForm, setCryptoForm] = useState({
    valor: "",
    endereco: "",
  })
  const [saqueProcessado, setSaqueProcessado] = useState(false)

  const saldoDisponivel = 19850.0
  const limiteMinimoPix = 10.0
  const limiteMinimosCripto = 50.0
  const taxaPix = 0.15
  const taxaCripto = 3.0

  const calcularTaxa = (valor: number, tipo: string) => {
    if (tipo === "pix") {
      return valor * (taxaPix / 100)
    } else {
      return valor * (taxaCripto / 100)
    }
  }

  const calcularValorLiquido = (valor: number, tipo: string) => {
    return valor - calcularTaxa(valor, tipo)
  }

  const handlePixSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaqueProcessado(true)
  }

  const handleCryptoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaqueProcessado(true)
  }

  const resetModal = () => {
    setPixForm({ valor: "", chavePix: "" })
    setCryptoForm({ valor: "", endereco: "" })
    setSaqueProcessado(false)
    setActiveTab("pix")
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      resetModal()
    }
    onOpenChange(open)
  }

  const valorAtual =
    activeTab === "pix" ? Number.parseFloat(pixForm.valor) || 0 : Number.parseFloat(cryptoForm.valor) || 0
  const limiteMinimo = activeTab === "pix" ? limiteMinimoPix : limiteMinimosCripto
  const taxa = calcularTaxa(valorAtual, activeTab)
  const valorLiquido = calcularValorLiquido(valorAtual, activeTab)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black/95 backdrop-blur-2xl border border-gray-800/50 text-white max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-teal-600/20 p-6 -m-6 mb-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-3 bg-blue-600/20 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <Send className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Solicitar Saque
                </span>
                <p className="text-sm font-normal text-gray-400 mt-1">Transfira seus fundos via PIX ou Criptomoeda</p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {!saqueProcessado ? (
          <div className="space-y-8">
            {/* Saldo Disponível */}
            <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm border-green-700/30 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-600/20 rounded-2xl">
                      <Wallet className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Saldo Disponível</p>
                      <p className="text-3xl font-bold text-green-400">
                        R$ {saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm font-medium">Limite Diário</p>
                    <p className="text-white font-semibold text-lg">R$ 5.000,00</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 text-xs">Disponível</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/50">
                <TabsTrigger
                  value="pix"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 rounded-xl transition-all duration-300"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  PIX
                </TabsTrigger>
                <TabsTrigger
                  value="crypto"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 rounded-xl transition-all duration-300"
                >
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Criptomoeda
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pix" className="space-y-6">
                {/* Informações PIX */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-3"></div>
                      <p className="text-gray-400 text-sm font-medium">Valor Mínimo</p>
                      <p className="text-white font-bold text-xl">R$ {limiteMinimoPix.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-3"></div>
                      <p className="text-gray-400 text-sm font-medium">Taxa</p>
                      <p className="text-white font-bold text-xl">{taxaPix}%</p>
                    </CardContent>
                  </Card>
                </div>

                <form onSubmit={handlePixSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="valorPix" className="text-gray-300 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Valor do Saque (R$)
                    </Label>
                    <Input
                      id="valorPix"
                      type="number"
                      step="0.01"
                      min={limiteMinimoPix}
                      max={saldoDisponivel}
                      value={pixForm.valor}
                      onChange={(e) => setPixForm((prev) => ({ ...prev, valor: e.target.value }))}
                      className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="chavePix" className="text-gray-300 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Chave PIX
                    </Label>
                    <Input
                      id="chavePix"
                      value={pixForm.chavePix}
                      onChange={(e) => setPixForm((prev) => ({ ...prev, chavePix: e.target.value }))}
                      className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                      required
                    />
                  </div>

                  {valorAtual > 0 && (
                    <Card className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Valor solicitado:</span>
                          <span className="text-white font-semibold text-lg">R$ {valorAtual.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Taxa ({taxaPix}%):</span>
                          <span className="text-red-400 font-semibold">- R$ {taxa.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-semibold text-lg">Valor líquido:</span>
                          <span className="text-green-400 font-bold text-xl">R$ {valorLiquido.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg shadow-purple-500/25"
                    disabled={valorAtual < limiteMinimo || valorAtual > saldoDisponivel}
                  >
                    Solicitar Saque PIX
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="crypto" className="space-y-6">
                {/* Informações Cripto */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-3"></div>
                      <p className="text-gray-400 text-sm font-medium">Valor Mínimo</p>
                      <p className="text-white font-bold text-xl">R$ {limiteMinimosCripto.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-3"></div>
                      <p className="text-gray-400 text-sm font-medium">Taxa</p>
                      <p className="text-white font-bold text-xl">{taxaCripto}%</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-yellow-600/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-yellow-400 font-semibold mb-2">Atenção!</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Transações de criptomoedas são irreversíveis. Verifique cuidadosamente o endereço da wallet
                        antes de confirmar.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCryptoSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="valorCrypto" className="text-gray-300 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Valor do Saque (R$)
                    </Label>
                    <Input
                      id="valorCrypto"
                      type="number"
                      step="0.01"
                      min={limiteMinimosCripto}
                      max={saldoDisponivel}
                      value={cryptoForm.valor}
                      onChange={(e) => setCryptoForm((prev) => ({ ...prev, valor: e.target.value }))}
                      className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="enderecoCrypto" className="text-gray-300 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Endereço da Wallet Bitcoin
                    </Label>
                    <Input
                      id="enderecoCrypto"
                      value={cryptoForm.endereco}
                      onChange={(e) => setCryptoForm((prev) => ({ ...prev, endereco: e.target.value }))}
                      className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-mono text-sm"
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      required
                    />
                  </div>

                  {valorAtual > 0 && (
                    <Card className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Valor solicitado:</span>
                          <span className="text-white font-semibold text-lg">R$ {valorAtual.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Taxa ({taxaCripto}%):</span>
                          <span className="text-red-400 font-semibold">- R$ {taxa.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-semibold text-lg">Valor líquido:</span>
                          <span className="text-green-400 font-bold text-xl">R$ {valorLiquido.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 font-medium shadow-lg shadow-orange-500/25"
                    disabled={valorAtual < limiteMinimo || valorAtual > saldoDisponivel}
                  >
                    Solicitar Saque Cripto
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-8 text-center">
            {/* Success Animation */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-500/30">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Saque Solicitado com Sucesso!</h3>
              <p className="text-gray-400">
                Seu saque de <span className="text-green-400 font-semibold text-lg">R$ {valorLiquido.toFixed(2)}</span>{" "}
                foi processado
              </p>
            </div>

            <Card className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Método</p>
                    <p className="text-white font-semibold capitalize">{activeTab}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Valor Líquido</p>
                    <p className="text-green-400 font-bold text-lg">R$ {valorLiquido.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Taxa</p>
                    <p className="text-red-400 font-semibold">R$ {taxa.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Processando</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-gray-400 text-sm">
              {activeTab === "pix"
                ? "O saque PIX será processado em até 2 minutos"
                : "O saque cripto será processado em até 30 minutos"}
            </p>

            <Button
              onClick={() => handleClose(false)}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg shadow-purple-500/25"
            >
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
