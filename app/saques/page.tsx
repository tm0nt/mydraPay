"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Wallet, Bitcoin, Clock, CheckCircle, XCircle, AlertCircle, Copy, QrCode } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Auxiliar para mapear campos e status
const statusMap = {
  PENDING: "processando",
  AUTHORIZED: "concluido",
  COMPLETED: "concluido",
  REJECTED: "rejeitado",
  CANCELED: "rejeitado",
};

function getStatusColor(status) {
  switch (status) {
    case "concluido": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "processando": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "rejeitado": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "concluido": return <CheckCircle className="w-4 h-4" />;
    case "processando": return <Clock className="w-4 h-4" />;
    case "rejeitado": return <XCircle className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
}

const calcularTaxa = (valor, tipo) => {
  if (tipo === "PIX") return valor * 0.0015;
  if (tipo === "Cripto") return valor * 0.03;
  return 0;
};

export default function SaquesPage() {
  const [activeTab, setActiveTab] = useState("pix");
  const [pixForm, setPixForm] = useState({
    valor: "",
    chavePix: "",
    tipoChave: "email",
    descricao: "",
  });
  const [cryptoForm, setCryptoForm] = useState({
    valor: "",
    moeda: "USDT",
    endereco: "",
    rede: "ethereum",
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Saldo, limites: busque do backend se tiver, ou ajuste conforme sua implementação
  const saldoDisponivel = 19850.00;
  const limiteDiario = 5000.00;
  const saquesDia = withdrawals
    .filter(w => ["PENDING", "AUTHORIZED", "COMPLETED"].includes(w.status))
    .reduce((sum, w) => sum + w.amount, 0);
  const limiteRestante = limiteDiario - saquesDia;

  // Buscar históricos
  async function fetchWithdrawals() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page);
      params.set("limit", pagination.limit);
      // você pode adicionar filtros em params se quiser
      const res = await fetch(`/api/withdrawals?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar saques");
      const json = await res.json();
      setWithdrawals(json.withdrawals || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      // trate erro se necessário
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit]);

  // Submete saque PIX
  async function handlePixSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    const valorNum = parseFloat(pixForm.valor.replace(",", "."));
    if (!valorNum || valorNum <= 0) {
      setSubmitError("Valor inválido");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: valorNum,
          method: "PIX",
          pixKeyType: pixForm.tipoChave,
          pixKey: pixForm.chavePix,
          description: pixForm.descricao,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setSubmitError(result.error || "Erro ao solicitar saque");
      } else {
        setPixForm({ valor: "", chavePix: "", tipoChave: "email", descricao: "" });
        fetchWithdrawals();
      }
    } catch {
      setSubmitError("Erro ao solicitar saque");
    } finally {
      setLoading(false);
    }
  }

  // Submete saque Cripto
  async function handleCryptoSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    const valorNum = parseFloat(cryptoForm.valor.replace(",", "."));
    if (!valorNum || valorNum <= 0) {
      setSubmitError("Valor inválido");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: valorNum,
          method: "CRYPTO",
          description: `Saque cripto: ${cryptoForm.moeda} na rede ${cryptoForm.rede}, endereço: ${cryptoForm.endereco}`,
          metadata: {
            moeda: cryptoForm.moeda,
            rede: cryptoForm.rede,
            endereco: cryptoForm.endereco,
          },
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setSubmitError(result.error || "Erro ao solicitar saque cripto");
      } else {
        setCryptoForm({ valor: "", moeda: "BTC", endereco: "", rede: "bitcoin" });
        fetchWithdrawals();
      }
    } catch {
      setSubmitError("Erro ao solicitar saque cripto");
    } finally {
      setLoading(false);
    }
  }

  // Mapeia para formato esperado na UI
  const mappedWithdrawals = withdrawals.map((w) => ({
    id: w.id,
    tipo: w.method === "PIX" ? "PIX" : (w.method === "CRYPTO" ? "Cripto" : w.method),
    valor: w.amount,
    taxa: calcularTaxa(w.amount, w.method === "PIX" ? "PIX" : "Cripto"), // ajuste se sua tabela tem fee
    valorLiquido: w.amount - calcularTaxa(w.amount, w.method === "PIX" ? "PIX" : "Cripto"),
    status: statusMap[w.status] || w.status?.toLowerCase() || "-",
    destino: w.method === "PIX"
      ? (w.pixKey ? `***${w.pixKey.slice(-3)}` : "")
      : (w.metadata?.endereco ? "Wallet Cripto" : ""),
    chavePix: w.pixKey || "",
    endereco: w.metadata?.endereco,
    data: new Date(w.createdAt),
    tempoProcessamento: undefined, // se houver no backend, use
    motivoRejeicao: w.errorMessage || undefined,
  }));

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Saques</h1>
                  <p className="text-gray-400">Transfira seus fundos via PIX ou Criptomoedas</p>
                </div>
              </div>
            </header>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Saldo Disponível</p>
                      <p className="text-2xl font-bold text-green-400">
                        R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Wallet className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Limite Diário</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {limiteDiario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-sm font-bold">24h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Disponível Hoje</p>
                      <p className="text-2xl font-bold text-blue-400">
                        R$ {limiteRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Send className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Withdrawal Forms */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Solicitar Saque</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                      <TabsTrigger value="pix" className="data-[state=active]:bg-purple-600">
                        <QrCode className="w-4 h-4 mr-2" />
                        PIX
                      </TabsTrigger>
                      <TabsTrigger value="crypto" className="data-[state=active]:bg-purple-600">
                        <Bitcoin className="w-4 h-4 mr-2" />
                        Cripto
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pix" className="space-y-6 mt-6">
                      <form onSubmit={handlePixSubmit} className="space-y-4">
                        {submitError && <div className="text-red-400 mb-2">{submitError}</div>}
                        <div className="space-y-2">
                          <Label className="text-gray-300">Valor do Saque</Label>
                          <Input
                            type="number"
                            placeholder="0,00"
                            value={pixForm.valor}
                            onChange={(e) => setPixForm(prev => ({ ...prev, valor: e.target.value }))}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                          {pixForm.valor && (
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between text-gray-400">
                                <span>Taxa (0,15%):</span>
                                <span>R$ {calcularTaxa(parseFloat(pixForm.valor) || 0, "PIX").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-white font-semibold">
                                <span>Valor Líquido:</span>
                                <span>R$ {((parseFloat(pixForm.valor) || 0) - calcularTaxa(parseFloat(pixForm.valor) || 0, "PIX")).toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Tipo de Chave PIX</Label>
                          <Select value={pixForm.tipoChave} onValueChange={(value) => setPixForm(prev => ({ ...prev, tipoChave: value }))}>
                            <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="telefone">Telefone</SelectItem>
                              <SelectItem value="cpf">CPF</SelectItem>
                              <SelectItem value="chave-aleatoria">Chave Aleatória</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Chave PIX</Label>
                          <Input
                            placeholder={
                              pixForm.tipoChave === "email" ? "exemplo@email.com" :
                                pixForm.tipoChave === "telefone" ? "+55 11 99999-9999" :
                                  pixForm.tipoChave === "cpf" ? "000.000.000-00" :
                                    "Chave aleatória"
                            }
                            value={pixForm.chavePix}
                            onChange={(e) => setPixForm(prev => ({ ...prev, chavePix: e.target.value }))}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Descrição (Opcional)</Label>
                          <Textarea
                            placeholder="Motivo do saque..."
                            value={pixForm.descricao}
                            onChange={(e) => setPixForm(prev => ({ ...prev, descricao: e.target.value }))}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                          <Send className="w-4 h-4 mr-2" />
                          Solicitar Saque PIX
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="crypto" className="space-y-6 mt-6">
                      <form onSubmit={handleCryptoSubmit} className="space-y-4">
                        {submitError && <div className="text-red-400 mb-2">{submitError}</div>}
                        <div className="space-y-2">
                          <Label className="text-gray-300">Valor do Saque</Label>
                          <Input
                            type="number"
                            placeholder="0,00"
                            value={cryptoForm.valor}
                            onChange={(e) => setCryptoForm(prev => ({ ...prev, valor: e.target.value }))}
                            className="bg-gray-800/50 border-gray-700/50 text-white"
                          />
                          {cryptoForm.valor && (
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between text-gray-400">
                                <span>Taxa (3%):</span>
                                <span>R$ {calcularTaxa(parseFloat(cryptoForm.valor) || 0, "Cripto").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-white font-semibold">
                                <span>Valor Líquido:</span>
                                <span>R$ {((parseFloat(cryptoForm.valor) || 0) - calcularTaxa(parseFloat(cryptoForm.valor) || 0, "Cripto")).toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Criptomoeda</Label>
                          <Select value={cryptoForm.moeda} onValueChange={(value) => setCryptoForm(prev => ({ ...prev, moeda: value }))}>
                            <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="USDT">Tether (USDT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Rede</Label>
                          <Select value={cryptoForm.rede} onValueChange={(value) => setCryptoForm(prev => ({ ...prev, rede: value }))}>
                            <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="ethereum">Ethereum (ERC-20)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Endereço da Wallet</Label>
                          <div className="relative">
                            <Input
                              placeholder="Endereço da carteira de destino"
                              value={cryptoForm.endereco}
                              onChange={(e) => setCryptoForm(prev => ({ ...prev, endereco: e.target.value }))}
                              className="bg-gray-800/50 border-gray-700/50 text-white pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                              tabIndex={-1}
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-yellow-400 font-medium">Atenção!</p>
                              <p className="text-gray-300 mt-1">
                                Verifique cuidadosamente o endereço da wallet. Transações de criptomoedas são irreversíveis.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
                          <Bitcoin className="w-4 h-4 mr-2" />
                          Solicitar Saque Cripto
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Withdrawal History */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Histórico de Saques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading && <div className="text-gray-400 mb-2">Carregando...</div>}
                    {mappedWithdrawals.length === 0 && !loading && (
                      <div className="text-gray-400 text-center py-4">Nenhum saque realizado.</div>
                    )}
                    {mappedWithdrawals.map((saque) => (
                      <div key={saque.id} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              saque.tipo === 'PIX' ? 'bg-purple-600/20' : 'bg-orange-600/20'
                            }`}>
                              {saque.tipo === 'PIX' ? (
                                <QrCode className="w-5 h-5 text-purple-400" />
                              ) : (
                                <Bitcoin className="w-5 h-5 text-orange-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{saque.id}</p>
                              <p className="text-gray-400 text-sm">{saque.tipo}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(saque.status)}>
                            {getStatusIcon(saque.status)}
                            <span className="ml-1 capitalize">{saque.status}</span>
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Valor:</span>
                            <span className="text-white font-semibold">
                              R$ {saque.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Taxa:</span>
                            <span className="text-red-400">
                              R$ {saque.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Valor Líquido:</span>
                            <span className="text-green-400 font-semibold">
                              R$ {saque.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Destino:</span>
                            <span className="text-white">{saque.destino}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data:</span>
                            <span className="text-gray-300">
                              {format(saque.data, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          {saque.tempoProcessamento && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tempo:</span>
                              <span className="text-blue-400">{saque.tempoProcessamento}</span>
                            </div>
                          )}
                          {saque.motivoRejeicao && (
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <p className="text-red-400 text-xs">{saque.motivoRejeicao}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Paginação simples */}
                    {pagination.pages > 1 &&
                      <div className="flex justify-between pt-4">
                        <Button
                          disabled={pagination.page === 1}
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        >
                          Anterior
                        </Button>
                        <span className="text-gray-400 self-center">
                          Página {pagination.page} de {pagination.pages}
                        </span>
                        <Button
                          disabled={pagination.page === pagination.pages}
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                        >
                          Próxima
                        </Button>
                      </div>
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
