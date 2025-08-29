"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, Copy, CheckCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface GerarPixModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GerarPixModal({ open, onOpenChange }: GerarPixModalProps) {
  const [formData, setFormData] = useState({
    nomeCliente: "",
    valor: "",     // máscara "R$ 0,00"
    email: "",
    telefone: "",  // máscara "(11) 99999-9999"
    cpf: "",       // máscara "000.000.000-00"
  })
  const [pixGerado, setPixGerado] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Dados retornados da API
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [pixCode, setPixCode] = useState<string>("")

  // Utilitário de moeda (pt-BR)
  const moeda = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    []
  )

  // Helpers de máscara/parse
  function maskedCurrencyToCents(masked: string): number {
    if (!masked) return 0
    const digits = masked.replace(/\D/g, "")
    if (!digits) return 0
    const valor = parseInt(digits, 10) // já em centavos
    return Number.isFinite(valor) ? valor : 0
  }

  function formatCurrencyInput(raw: string): string {
    const digits = raw.replace(/\D/g, "")
    const asNumber = digits ? parseInt(digits, 10) : 0 // centavos
    const reais = asNumber / 100
    return moeda.format(reais) // "R$ 1.234,56"
  }

  function parseMaskedToCents(masked: string): number {
    return maskedCurrencyToCents(masked)
  }

  function formatCPF(raw: string): string {
    const v = raw.replace(/\D/g, "").slice(0, 11)
    if (v.length <= 3) return v
    if (v.length <= 6) return v.replace(/^(\d{3})(\d{0,3})$/, "$1.$2")
    if (v.length <= 9) return v.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3")
    return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*$/, "$1.$2.$3-$4")
  }

  function formatTelefone(raw: string): string {
    const v = raw.replace(/\D/g, "").slice(0, 11)
    if (v.length <= 2) return v
    if (v.length <= 6) {
      // até (11) 2345
      return v.replace(/^(\d{2})(\d{0,4})$/, "($1) $2")
    }
    if (v.length <= 10) {
      // fixo: (11) 2345-6789
      return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*$/, "($1) $2-$3").replace(/-$/, "")
    }
    // celular: (11) 91234-5678
    return v.replace(/^(\d{2})(\d{5})(\d{0,4}).*$/, "($1) $2-$3").replace(/-$/, "")
  }

  // Handlers de mudança com máscara
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, valor: formatCurrencyInput(e.target.value) }))
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, cpf: formatCPF(e.target.value) }))
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, telefone: formatTelefone(e.target.value) }))
  }

  const copiarCodigo = async () => {
    try {
      if (!pixCode) return
      await navigator.clipboard.writeText(pixCode)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      // silencioso
    }
  }

  const resetModal = () => {
    setFormData({
      nomeCliente: "",
      valor: "",
      email: "",
      telefone: "",
      cpf: "",
    })
    setPixGerado(false)
    setCopiado(false)
    setErro(null)
    setPixCode("")
    setQrImage(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetModal()
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setLoading(true)

    try {
      const amount = parseMaskedToCents(formData.valor) // inteiro em centavos
      if (amount <= 0) {
        setErro("Valor inválido")
        setLoading(false)
        return
      }

      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, // centavos
          cpf: formData.cpf.replace(/\D/g, ""),
          nome: formData.nomeCliente,
          telefone: formData.telefone.replace(/\D/g, ""),
          email: formData.email,
        }),
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || "Falha ao gerar PIX")
      }

      const data = await res.json()
      const qrcode = data?.qrcode ?? null
      const pix = data?.pix ?? ""

      setQrImage(typeof qrcode === "string" && qrcode.startsWith("data:image") ? qrcode : null)
      setPixCode(pix || "")
      setPixGerado(true)
    } catch (err: any) {
      setErro("Não foi possível gerar o PIX. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Estilo minimalista dark com primária roxa
  const contentClass =
    "bg-black text-white border border-gray-800 w-full max-w-lg rounded-xl p-0 overflow-hidden"

  const headerClass = "px-5 py-4 border-b border-gray-800"

  const sectionCardClass =
    "bg-neutral-950 border border-gray-800 rounded-xl"

  const primaryButtonClass =
    "h-11 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600/40 transition-colors"

  const outlineGrayButtonClass =
    "h-11 rounded-lg border border-gray-800 text-white bg-transparent hover:bg-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600/30 transition-colors"

  const inputClass =
    "bg-neutral-900 border border-gray-800 text-white rounded-lg h-11 px-3 focus-visible:ring-2 focus-visible:ring-purple-600/30 focus-visible:border-purple-600"

  const inputDisabledClass =
    "disabled:opacity-100 disabled:bg-neutral-900 disabled:text-gray-300 disabled:border-gray-800 disabled:cursor-not-allowed"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={contentClass}>
        <div className={headerClass}>
                <DialogHeader className="p-0">
                  <DialogTitle className="flex items-center justify-center gap-2 text-base sm:text-lg font-semibold">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30">
                      <QrCode className="w-4 h-4 text-purple-400" />
                    </span>
                    Gerar PIX
                  </DialogTitle>
                  <p className="text-center text-sm text-gray-400 mt-1">Receba um PIX direto na sua conta!</p>
                </DialogHeader>
        </div>

        <div className="px-5 sm:px-6 pb-6 pt-5">
          {!pixGerado ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {erro && (
                <div role="alert" className="rounded-lg border border-red-900/40 bg-red-950/40 text-red-100 px-4 py-3">
                  {erro}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nomeCliente" className="text-gray-300">Nome do Cliente</Label>
                <Input
                  id="nomeCliente"
                  value={formData.nomeCliente}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nomeCliente: e.target.value }))}
                  className={inputClass}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={handleCPFChange}
                    className={inputClass}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-gray-300">Valor (R$)</Label>
                  <Input
                    id="valor"
                    inputMode="numeric"
                    autoComplete="off"
                    value={formData.valor}
                    onChange={handleValorChange}
                    className={inputClass}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-gray-300">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleTelefoneChange}
                    className={inputClass}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                  placeholder="cliente@email.com"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className={outlineGrayButtonClass}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className={primaryButtonClass} disabled={loading}>
                  {loading ? "Gerando..." : "Gerar PIX"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <CheckCircle className="w-9 h-9 text-purple-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-white">PIX gerado</h3>
                  <p className="text-gray-400 text-sm">
                    Valor <span className="text-white font-medium">{formData.valor || "R$ 0,00"}</span> para {formData.nomeCliente}
                  </p>
                </div>
              </div>

              {/* Card único: QRCode + Input de Copia e Cola abaixo */}
              <Card className={`${sectionCardClass} overflow-hidden`}>
                <CardContent className="p-5 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-medium">QR Code PIX</h4>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white rounded-xl p-4">
                      {qrImage ? (
                        <img
                          src={qrImage}
                          alt="QR Code PIX"
                          className="w-[180px] h-[180px] object-contain"
                        />
                      ) : (
                        <QRCodeSVG value={pixCode || "PIX"} size={180} bgColor="#ffffff" fgColor="#000000" level="M" includeMargin />
                      )}
                    </div>
                  </div>

                  {/* Input readOnly/disabled + botão copiar */}
                  <div className="text-left space-y-2">
                    <Label htmlFor="pixCode" className="text-gray-300">Código “copia e cola”</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="pixCode"
                        value={pixCode || ""}
                        readOnly
                        disabled
                        className={`${inputClass} ${inputDisabledClass} font-mono text-sm`}
                      />
                      <Button
                        onClick={copiarCodigo}
                        className={`${primaryButtonClass} w-full sm:w-auto`}
                        disabled={copiado || !pixCode}
                      >
                        {copiado ? "Copiado!" : (
                          <span className="inline-flex items-center">
                            <Copy className="w-4 h-4 mr-2" /> Copiar
                          </span>
                        )}
                      </Button>
                    </div>
                    <p className="text-gray-500 text-xs">Clique em copiar para usar no app do banco.</p>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setPixGerado(false)}
                  variant="outline"
                  className={outlineGrayButtonClass + " flex-1"}
                >
                  Gerar novo PIX
                </Button>
                <Button onClick={() => handleClose(false)} className={primaryButtonClass + " flex-1"}>
                  Concluir
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({
  label,
  value,
  small = false,
  strong = false,
}: {
  label: string
  value: string
  small?: boolean
  strong?: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`${strong ? "font-bold" : "font-semibold"} ${small ? "text-sm" : "text-base"} text-white`}>
        {value}
      </p>
    </div>
  )
}
