"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Download, CalendarIcon, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ExtratosPage() {
  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState("30-dias");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // State de API
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Busca API
  async function fetchStatements() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("page", pagination.page || "1");
    params.set("limit", pagination.limit || "20");
    if (dateRange.from) params.set("startDate", dateRange.from.toISOString());
    if (dateRange.to) params.set("endDate", dateRange.to.toISOString());
    try {
      const res = await fetch(`/api/statements?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar extratos");
      const data = await res.json();
      setStatements(data.statements || []);
      setCurrentBalance(data.currentBalance || 0);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      setError("Erro ao carregar extratos");
    } finally {
      setLoading(false);
    }
  }

  // Atualiza dateRange conforme selectedPeriod
  useEffect(() => {
    if (selectedPeriod !== "personalizado") {
      let days = 30;
      if (selectedPeriod === "7-dias") days = 7;
      if (selectedPeriod === "90-dias") days = 90;
      setDateRange({
        from: subDays(new Date(), days),
        to: new Date(),
      });
      setPagination(p => ({ ...p, page: 1 }));
    }
  }, [selectedPeriod]);

  // Busca sempre que os filtros mudam
  useEffect(() => {
    fetchStatements();
    // eslint-disable-next-line
  }, [dateRange.from, dateRange.to, pagination.page, pagination.limit]);

  // Sumarização
  const totalEntradas = statements.reduce((sum, s) => sum + (s.variation > 0 ? s.variation : 0), 0);
  const totalSaidas = statements.reduce((sum, s) => sum + (s.variation < 0 ? Math.abs(s.variation) : 0), 0);
  const totalTransacoes = statements.reduce((sum, s) => sum + (s.transactionsCount ?? 0), 0);

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Extratos</h1>
                  <p className="text-gray-400">Visualize o histórico detalhado das movimentações</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </header>

            {/* Filters */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="7-dias">Últimos 7 dias</SelectItem>
                      <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="90-dias">Últimos 90 dias</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedPeriod === "personalizado" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full md:w-auto bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Selecionar Período
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
                            setPagination(p => ({ ...p, page: 1 }));
                          }}
                          numberOfMonths={2}
                          className="rounded-xl"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Saldo Atual</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Wallet className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Entradas</p>
                      <p className="text-2xl font-bold text-green-400">
                        R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                        R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      <p className="text-gray-400 text-sm">Transações</p>
                      <p className="text-2xl font-bold text-white">
                        {totalTransacoes}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Statement */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Extrato Diário
                  {loading && <span className="ml-3 text-xs text-gray-400">Carregando...</span>}
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
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Saldo Inicial</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Entradas</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Saídas</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Saldo Final</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Transações</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statements.map((item, idx) => {
                        const entradas = item.variation > 0 ? item.variation : 0;
                        const saidas = item.variation < 0 ? Math.abs(item.variation) : 0;
                        return (
                          <tr key={item.id || idx} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <span className="text-white font-medium">
                                {format(new Date(item.asOf), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-300">
                                R$ {item.initialBalance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-green-400 font-semibold">
                                +R$ {entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-red-400 font-semibold">
                                -R$ {saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-white font-bold">
                                R$ {item.finalBalance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className="bg-blue-500/20 text-blue-400">
                                {item.transactionsCount ?? "-"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`font-semibold ${item.variation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {item.variation >= 0 ? '+' : ''}R$ {item.variation?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {statements.length === 0 && !loading && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">Nenhum extrato encontrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Paginação */}
                <div className="flex justify-between mt-4">
                  <Button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1)
                    }))}
                  >
                    Anterior
                  </Button>
                  <span className="text-gray-400 self-center">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages, prev.page + 1)
                    }))}
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
