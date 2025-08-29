"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, QrCode, Wallet, TrendingUp } from "lucide-react"
import { useUserStore } from "@/stores/useProfileStore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface SolicitarSaqueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SolicitarSaqueModal({ open, onOpenChange }: SolicitarSaqueModalProps) {
  const { data, fetchProfile } = useUserStore()
  const [pixForm, setPixForm] = useState({ valor: "", chavePix: "", pixType: "CPF" as "CPF" | "EMAIL" | "TELEFONE" | "ALEATORIA" })
  const [saqueProcessado, setSaqueProcessado] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Configurações do store
  const saldoDisponivel = data?.balance?.current ?? 0
  const limiteMinimoPix = parseFloat(data?.settings?.minPixWithdrawal ?? "10")
  const pixFeePercent = parseFloat(data?.settings?.pixFeePercent ?? "1.5")
  const pixFeeFixed = parseFloat(data?.settings?.pixFeeFixed ?? "0.5")
  const minPixTax = parseFloat(data?.settings?.minPixWithdrawalTax ?? "0")
  const dailyLimit = parseFloat(data?.settings?.dailyWithdrawalLimit ?? "5000")

  // Utilitário de moeda (pt-BR)
  const moeda = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    []
  )

  // Helpers de máscara/parse
  function formatCurrencyInput(raw: string): string {
    const digits = raw.replace(/\D/g, "")
    const asNumber = digits ? parseInt(digits, 10) : 0 // centavos
    const reais = asNumber / 100
    return moeda.format(reais) // "R$ 1.234,56"
  }

  function maskedCurrencyToNumber(masked: string): number {
    if (!masked) return 0
    const digits = masked.replace(/\D/g, "")
    if (!digits) return 0
    return (parseInt(digits, 10) || 0) / 100 // em reais
  }

  // Máscaras para chave PIX
  function formatCPF(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
    if (d.length <= 9) return d.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*$/, "$1.$2.$3-$4");
  }

  function formatTelefone(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
  }

  function formatEmail(v: string): string {
    return v; // Sem máscara, mas pode adicionar validação futura
  }

  function formatAleatoria(v: string): string {
    return v; // Sem máscara
  }

  // Função genérica para formatar chave PIX baseada no tipo
  function formatPixKey(type: string, value: string): string {
    switch (type) {
      case "CPF": return formatCPF(value);
      case "TELEFONE": return formatTelefone(value);
      case "EMAIL": return formatEmail(value);
      case "ALEATORIA": return formatAleatoria(value);
      default: return value;
    }
  }

  // Cálculos
  const valorAtual = maskedCurrencyToNumber(pixForm.valor)
  const taxa = minPixTax
  const valorLiquido = Math.max(0, valorAtual - taxa)
  const canSubmit = valorAtual >= limiteMinimoPix && valorAtual <= saldoDisponivel && valorAtual <= dailyLimit

  // Handlers de mudança (com máscara)
  const handleValorPixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPixForm((prev) => ({ ...prev, valor: formatCurrencyInput(e.target.value) }))
  }

  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPixKey(pixForm.pixType, raw);
    setPixForm((prev) => ({ ...prev, chavePix: formatted }));
  }

  // Submit PIX com integração da API
  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Remove a máscara da chave PIX para envio
      let pixKeyClean = pixForm.chavePix;
      if (pixForm.pixType === "CPF") {
        pixKeyClean = pixForm.chavePix.replace(/\D/g, "");
      } else if (pixForm.pixType === "TELEFONE") {
        pixKeyClean = pixForm.chavePix.replace(/\D/g, "");
      }

      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: valorAtual,
          method: "PIX",
          pixKeyType: pixForm.pixType,
          pixKey: pixKeyClean,
          description: `Saque PIX - ${pixForm.pixType}: ${pixForm.chavePix}`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar saque")
      }

      // Sucesso
      toast.success("Saque solicitado com sucesso!", {
        description: `Valor líquido de ${moeda.format(valorLiquido)} em processamento.`,
        duration: 5000,
      })

      setSaqueProcessado(true)
      
      // Atualiza o perfil para refletir o novo saldo
      await fetchProfile()

    } catch (error) {
      console.error("Erro ao solicitar saque:", error)
      toast.error("Erro ao solicitar saque", {
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset/fechamento
  const resetModal = () => {
    setPixForm({ valor: "", chavePix: "", pixType: "CPF" })
    setSaqueProcessado(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) resetModal()
    onOpenChange(open)
  }

  // Estilos
  const contentClass = "bg-black text-white border border-gray-800 w-full max-w-lg rounded-xl p-0 overflow-hidden"
  const headerClass = "px-5 py-4 border-b border-gray-800"
  const sectionCardClass = "bg-neutral-950 border border-gray-800 rounded-xl"
  const primaryButtonClass = "h-11 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600/40 transition-colors disabled:opacity-50"
  const inputClass = "bg-neutral-900 border border-gray-800 text-white rounded-lg h-11 px-3 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-purple-600/30 focus-visible:border-purple-600"

  const getTaxaLabel = () => {
    if (minPixTax > 0) {
      return moeda.format(minPixTax);
    } else {
      return 'Sem taxa';
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={contentClass}>
        {/* Header */}
        <div className={headerClass}>
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center justify-center gap-2 text-base sm:text-lg font-semibold">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30">
                <Send className="w-4 h-4 text-purple-400" />
              </span>
              Solicitar Saque PIX
            </DialogTitle>
            <p className="text-center text-sm text-gray-400 mt-1">Transfira seus fundos via PIX</p>
          </DialogHeader>
        </div>

        <div className="px-5 sm:px-6 pb-6 pt-5 space-y-6">
          {!saqueProcessado ? (
            <>
              {/* Saldo */}
              <Card className={`${sectionCardClass} overflow-hidden`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-neutral-900 border border-gray-800">
                        <Wallet className="w-5 h-5 text-gray-300" />
                      </span>
                      <div>
                        <p className="text-gray-400 text-xs">Saldo Disponível</p>
                        <p className="text-xl font-semibold">
                          {moeda.format(saldoDisponivel)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Limite Diário</p>
                      <p className="text-sm font-medium text-white">{moeda.format(dailyLimit)}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">Disponível</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PIX Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className={`${sectionCardClass} overflow-hidden`}>
                  <CardContent className="p-4 text-center">
                    <p className="text-gray-400 text-xs">Valor Mínimo</p>
                    <p className="text-base font-semibold">{moeda.format(limiteMinimoPix)}</p>
                  </CardContent>
                </Card>
                <Card className={`${sectionCardClass} overflow-hidden`}>
                  <CardContent className="p-4 text-center">
                    <p className="text-gray-400 text-xs">Taxa</p>
                    <p className="text-base font-semibold">{getTaxaLabel()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Form PIX */}
              <form onSubmit={handlePixSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="valorPix" className="text-gray-300">Valor do Saque (R$)</Label>
                  <Input
                    id="valorPix"
                    inputMode="numeric"
                    autoComplete="off"
                    value={pixForm.valor}
                    onChange={handleValorPixChange}
                    className={inputClass}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Tipo de Chave PIX</Label>
                  <Select
                    value={pixForm.pixType}
                    onValueChange={(value: "CPF" | "EMAIL" | "TELEFONE" | "ALEATORIA") => {
                      setPixForm((prev) => ({ ...prev, pixType: value, chavePix: "" }));
                    }}
                  >
                    <SelectTrigger className="bg-neutral-900 border border-gray-800 text-white rounded-lg h-11 px-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border border-gray-800 text-white">
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="EMAIL">E-mail</SelectItem>
                      <SelectItem value="TELEFONE">Telefone</SelectItem>
                      <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chavePix" className="text-gray-300">Chave PIX</Label>
                  <Input
                    id="chavePix"
                    value={pixForm.chavePix}
                    onChange={handlePixKeyChange}
                    className={inputClass + " font-normal"}
                    placeholder={
                      pixForm.pixType === "CPF" ? "000.000.000-00" :
                      pixForm.pixType === "TELEFONE" ? "(00) 00000-0000" :
                      pixForm.pixType === "EMAIL" ? "exemplo@email.com" :
                      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    }
                    required
                  />
                </div>

                {valorAtual > 0 && (
                  <Card className={`${sectionCardClass} overflow-hidden`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Valor solicitado:</span>
                        <span className="text-white font-medium">{moeda.format(valorAtual)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Taxa:</span>
                        <span className="text-red-400 font-medium">- {moeda.format(taxa)}</span>
                      </div>
                      <div className="h-px bg-gray-800 my-1" />
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">Valor líquido:</span>
                        <span className="text-green-400 font-bold">{moeda.format(valorLiquido)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  type="submit" 
                  className={`${primaryButtonClass} w-full`} 
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Processando..." : "Solicitar Saque PIX"}
                </Button>
              </form>
            </>
          ) : (
            // Sucesso
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-purple-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">Saque solicitado com sucesso!</h3>
                <p className="text-gray-400 text-sm">
                  Valor líquido de <span className="text-white font-medium">{moeda.format(valorLiquido)}</span> em processamento.
                </p>
              </div>

              <Card className={`${sectionCardClass} overflow-hidden`}>
                <CardContent className="p-5 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Método</p>
                    <p className="text-white font-semibold">PIX</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Valor Líquido</p>
                    <p className="text-green-400 font-bold">{moeda.format(valorLiquido)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Taxa</p>
                    <p className="text-red-400 font-semibold">{moeda.format(taxa)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Status</p>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Processando
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <p className="text-gray-400 text-sm">
                O saque PIX costuma compensar em até alguns minutos.
              </p>

              <Button onClick={() => handleClose(false)} className={`${primaryButtonClass} w-full`}>
                Concluir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
