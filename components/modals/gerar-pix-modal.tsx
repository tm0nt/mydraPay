// app/(sua-pasta)/GerarPixModal.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Copy, CheckCircle, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface GerarPixModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GerarPixModal({ open, onOpenChange }: GerarPixModalProps) {
  const [formData, setFormData] = useState({
    nomeCliente: "",
    valor: "",
    email: "",
    telefone: "",
    cpf: "",
  });
  const [pixGerado, setPixGerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Dados retornados pela API
  const [qrImage, setQrImage] = useState<string | null>(null); // data:image/... do provedor
  const [pixCode, setPixCode] = useState<string>(""); // código "copia e cola"

  const copiarCodigo = async () => {
    try {
      if (!pixCode) return;
      await navigator.clipboard.writeText(pixCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  const resetModal = () => {
    setFormData({
      nomeCliente: "",
      valor: "",
      email: "",
      telefone: "",
      cpf: "",
    });
    setPixGerado(false);
    setCopiado(false);
    setErro(null);
    setPixCode("");
    setQrImage(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetModal();
    onOpenChange(isOpen);
  };

  // Converte "99,90" ou "99.90" para centavos inteiros
  function parseReaisToCents(v: string): number {
    const normalized = v.replace(/\./g, "").replace(",", "."); // 1.234,56 → 1234.56
    const n = Number.parseFloat(normalized);
    if (Number.isNaN(n)) return 0;
    return Math.round(n * 100);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const amount = parseReaisToCents(formData.valor);
      if (amount <= 0) {
        setErro("Valor inválido");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cpf: formData.cpf,
          nome: formData.nomeCliente,
          telefone: formData.telefone,
          email: formData.email,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha ao gerar PIX");
      }

      const data = await res.json();

      // data.qrcode pode ser data:image/...; data.pix é o "copia e cola"
      const qrcode = data?.qrcode ?? null;
      const pix = data?.pix ?? "";

      setQrImage(typeof qrcode === "string" && qrcode.startsWith("data:image") ? qrcode : null);
      setPixCode(pix || "");

      setPixGerado(true);
    } catch (err: any) {
      console.error(err);
      setErro("Não foi possível gerar o PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Classes para conter o conteúdo no desktop sem “comer” a tela
  const contentClass =
    [
      "bg-black/95 backdrop-blur-2xl text-white",
      "border border-gray-800/50",
      "w-[92vw] sm:w-[90vw] md:w-[85vw] lg:w-auto", // largura fluida até desktop
      "md:max-w-5xl lg:max-w-6xl",                  // limite máximo no desktop
      "rounded-2xl shadow-2xl",
      "p-0 md:p-6",                                  // padding consistente
      "max-h-[40vh] overflow-y-auto overscroll-contain", // rolagem interna
      "scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent",
    ].join(" ");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={contentClass}>
        {/* Header com gradiente - sem margens negativas */}
        <div className="relative bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 px-6 py-6 rounded-t-2xl">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-t-2xl" />
          <DialogHeader className="relative z-10 p-0">
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
          <form onSubmit={handleSubmit} className="space-y-8 px-6 pb-6">
            {erro && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
                {erro}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="nomeCliente" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
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
                <Label htmlFor="cpf" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                  className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="valor" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Valor (R$)
                </Label>
                <Input
                  id="valor"
                  inputMode="decimal"
                  value={formData.valor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                  className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 text-white rounded-2xl h-12 px-4 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
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

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="telefone" className="text-gray-300 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
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

            <div className="flex gap-4 pt-2 md:pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 h-12 rounded-2xl border-gray-700/50 hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 font-medium"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg shadow-purple-500/25"
                disabled={loading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? "Gerando..." : "Gerar PIX"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8 px-6 pb-6">
            {/* Sucesso */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-500/30">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">PIX Gerado com Sucesso!</h3>
                <p className="text-gray-400">
                  PIX de{" "}
                  <span className="text-green-400 font-semibold text-lg">
                    R$ {Number.parseFloat(formData.valor.replace(",", ".")).toFixed(2)}
                  </span>{" "}
                  para {formData.nomeCliente}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* QR Code */}
              <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
                      <QrCode className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-semibold text-lg">QR Code PIX</h4>
                    </div>

                    <div className="relative inline-block">
                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl" />
                      <div className="relative bg-white p-4 md:p-6 rounded-3xl shadow-2xl">
                        {qrImage ? (
                          <img
                            src={qrImage}
                            alt="QR Code PIX"
                            className="w-[200px] h-[200px] md:w-[220px] md:h-[220px] object-contain"
                          />
                        ) : (
                          <QRCodeSVG
                            value={pixCode || "PIX"}
                            size={220}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="M"
                            includeMargin
                          />
                        )}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm">Escaneie com o app do seu banco</p>
                  </div>
                </CardContent>
              </Card>

              {/* Código Copia e Cola */}
              <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-2 mb-2 md:mb-4">
                      <Copy className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-semibold text-lg">Código Copia e Cola</h4>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-gray-600/50">
                      <p className="text-gray-300 text-sm font-mono break-all leading-relaxed">
                        {pixCode || "—"}
                      </p>
                    </div>

                    <Button
                      onClick={copiarCodigo}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-medium shadow-lg shadow-blue-500/25"
                      disabled={copiado || !pixCode}
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
                  <Info label="Cliente" value={formData.nomeCliente} dotClass="bg-purple-500" />
                  <Info
                    label="Valor"
                    value={`R$ ${Number.parseFloat(formData.valor.replace(",", ".")).toFixed(2)}`}
                    dotClass="bg-green-500"
                    strong
                    accent
                  />
                  <Info label="E-mail" value={formData.email} dotClass="bg-blue-500" small />
                  <Info label="Telefone" value={formData.telefone} dotClass="bg-cyan-500" />
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
  );
}

function Info({
  label,
  value,
  dotClass,
  small = false,
  strong = false,
  accent = false,
}: {
  label: string;
  value: string;
  dotClass: string;
  small?: boolean;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`w-3 h-3 ${dotClass} rounded-full mx-auto mb-2`} />
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`${strong ? "font-bold" : "font-semibold"} ${accent ? "text-green-400" : "text-white"} ${small ? "text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}
