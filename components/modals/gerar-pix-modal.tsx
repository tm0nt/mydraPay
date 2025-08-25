"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, Copy, CheckCircle, Sparkles } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface GerarPixModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GerarPixModal({ open, onOpenChange }: GerarPixModalProps) {
  const [formData, setFormData] = useState({
    nomeCliente: "",
    valor: "",
    email: "",
    telefone: "",
  })
  const [pixGerado, setPixGerado] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const codigoPix =
    "00020126580014br.gov.bcb.pix013636c4c2c4-4c4c-4c4c-4c4c-4c4c4c4c4c4c5204000053039865802BR5925NOME DO BENEFICIARIO6009SAO PAULO62070503***6304"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPixGerado(true)
  }

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigoPix)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const resetModal = () => {
    setFormData({
      nomeCliente: "",
      valor: "",
      email: "",
      telefone: "",
    })
    setPixGerado(false)
    setCopiado(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      resetModal()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black/95 backdrop-blur-2xl border border-gray-800/50 text-white max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 p-6 -m-6 mb-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-3 bg-purple-600/20 rounded-2xl backdrop-blur-sm border border-purple-500/30">
                <QrCode className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Gerar PIX
                </span>
                <p className="text-sm font-normal text-gray-400 mt-1">
                  Crie um QR Code personalizado para receber pagamentos
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {!pixGerado ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="nomeCliente" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Nome do Cliente
                </Label>
                <Input
                  id="nomeCliente"
                  value={formData.nomeCliente}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nomeCliente: e.target.value }))}
                  className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="valor" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Valor (R$)
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                  className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  placeholder="cliente@email.com"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="telefone" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                  className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 h-12 rounded-2xl border-gray-700/50 hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar PIX
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Success Animation */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-500/30">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">PIX Gerado com Sucesso!</h3>
                <p className="text-gray-400">
                  PIX de{" "}
                  <span className="text-green-400 font-semibold text-lg">
                    R$ {Number.parseFloat(formData.valor).toFixed(2)}
                  </span>{" "}
                  para {formData.nomeCliente}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* QR Code */}
              <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <QrCode className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-semibold text-lg">QR Code PIX</h4>
                    </div>

                    <div className="relative inline-block">
                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>
                      <div className="relative bg-white p-6 rounded-3xl shadow-2xl">
                        <QRCodeSVG
                          value={codigoPix}
                          size={220}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm">Escaneie com o app do seu banco</p>
                  </div>
                </CardContent>
              </Card>

              {/* Código Copia e Cola */}
              <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Copy className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-semibold text-lg">Código Copia e Cola</h4>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-600/50">
                      <p className="text-gray-300 text-sm font-mono break-all leading-relaxed">{codigoPix}</p>
                    </div>

                    <Button
                      onClick={copiarCodigo}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25"
                      disabled={copiado}
                    >
                      {copiado ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Código
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informações do PIX */}
            <Card className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Cliente</p>
                    <p className="text-white font-semibold">{formData.nomeCliente}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Valor</p>
                    <p className="text-green-400 font-bold text-lg">
                      R$ {Number.parseFloat(formData.valor).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">E-mail</p>
                    <p className="text-white font-semibold text-sm">{formData.email}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Telefone</p>
                    <p className="text-white font-semibold">{formData.telefone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => setPixGerado(false)}
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-gray-700/50 hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 font-medium"
              >
                Gerar Novo PIX
              </Button>
              <Button
                onClick={() => handleClose(false)}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg shadow-purple-500/25"
              >
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
