"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowRightLeft,
  Search,
  Filter,
  Download,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalFees: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper para mapear status/metodo/type do backend para display/selecao
  const statusMap = {
    PENDING: "processando",
    APPROVED: "aprovada",
    REJECTED: "rejeitada",
  };
  const methodMap = {
    PIX: "PIX",
    CREDIT_CARD: "Cartão",
    BOLETO: "Boleto",
    CRYPTO: "Cripto",
    OTHER: "Outro",
  };
  const typeMap = {
    INCOMING: "entrada",
    OUTGOING: "saida",
  };

  // Busca dados da API
  async function fetchTransactions() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", pagination.page.toString());
    params.set("limit", pagination.limit.toString());
    if (statusFilter !== "todos") params.set("status", statusFilter.toUpperCase());
    if (typeFilter !== "todos") params.set("type", typeFilter === "entrada" ? "INCOMING" : "OUTGOING");
    if (dateRange.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange.to) params.set("endDate", dateRange.to.toISOString());
    // Se sua API tiver busca textual:
    if (searchTerm) params.set("q", searchTerm);

    try {
      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error("Erro ao buscar transações");
      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
      setStats(data.stats || { totalAmount: 0, totalFees: 0, totalTransactions: 0 });
    } catch (err) {
      setError("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 })); // Sempre ir para página 1 ao mudar filtros
    // eslint-disable-next-line
  }, [searchTerm, dateRange.from, dateRange.to, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    dateRange.from,
    dateRange.to,
    statusFilter,
    typeFilter,
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "aprovada":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processando":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejeitada":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "PIX":
        return "bg-purple-500/20 text-purple-400";
      case "Cartão":
        return "bg-blue-500/20 text-blue-400";
      case "Boleto":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const mappedTransactions = transactions.map((tx) => ({
    ...tx,
    status: statusMap[tx.status] ?? tx.status?.toLowerCase(),
    method: methodMap[tx.method] ?? tx.method,
    type: typeMap[tx.type] ?? tx.type,
    date: new Date(tx.createdAt || tx.date),
    fee: tx.feeAmount ?? tx.fee ?? 0,
    amount: tx.amount,
    description: tx.description,
    id: tx.id,
  }));

  const totalEntradas = stats.totalAmount || 0;
  const totalTaxas = stats.totalFees || 0;

  const totalSaidas = transactions
    .filter((t) => t.type === "OUTGOING" && t.status === "aprovada")
    .reduce((sum, t) => sum + t.amount, 0);

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Transações</h1>
                  <p className="text-gray-400">Histórico completo de movimentações financeiras</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Entradas</p>
                      <p className="text-2xl font-bold text-green-400">
                        R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Saídas</p>
                      <p className="text-2xl font-bold text-red-400">
                        R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Saldo Líquido</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {(totalEntradas - totalSaidas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <ArrowRightLeft className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Taxas</p>
                      <p className="text-2xl font-bold text-orange-400">
                        R$ {totalTaxas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por descrição ou ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="processando">Processando</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="entrada">Entradas</SelectItem>
                      <SelectItem value="saida">Saídas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-auto bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Período
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="end">
                      <Calendar
                        mode="range"
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to,
                        }}
                        onSelect={(range) => {
                          setDateRange({
                            from: range?.from,
                            to: range?.to,
                          });
                        }}
                        numberOfMonths={2}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Transações ({mappedTransactions.length}){" "}
                  {loading && <span className="text-sm text-gray-500 ml-2">Carregando...</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-red-400 mb-4">Erro: {error}</div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Descrição</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Método</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Taxa</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <span className="text-white font-mono text-sm">{transaction.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  transaction.type === "entrada"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="text-white">{transaction.description}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getMethodColor(transaction.method)}>
                              {transaction.method}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`font-semibold ${
                                transaction.type === "entrada"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.type === "entrada" ? "+" : "-"}R$ {transaction.amount.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400">
                              R$ {transaction.fee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400">
                              {format(transaction.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-700/50">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-700/50">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {mappedTransactions.length === 0 && !loading && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400">Nenhuma transação encontrada.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Paginação */}
                <div className="flex justify-between mt-4">
                  <Button
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                  >
                    Anterior
                  </Button>
                  <span className="text-gray-400 self-center">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    disabled={pagination.page === pagination.pages}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.pages, prev.page + 1),
                      }))
                    }
                  >
                    Próxima
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
