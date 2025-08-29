// app/extratos/page.tsx
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  FileText,
  Download,
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function ExtratosPage() {
  /* ------------------------------ STATE ----------------------------------- */
  const [selectedPeriod, setSelectedPeriod] = useState("30-dias");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [statements, setStatements] = useState<any[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  /* ---------------------------- API CALL ---------------------------------- */
  async function fetchStatements() {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));
    params.set("startDate", dateRange.from.toISOString());
    params.set("endDate", dateRange.to.toISOString());

    try {
      const res = await fetch(`/api/statements?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao buscar extratos");
      const data = await res.json();

      /* Convert Decimal strings → Numbers */
      const mapped = (data.statements || []).map((s: any) => ({
        ...s,
        initialBalance: Number(s.initialBalance),
        variation: Number(s.variation),
        finalBalance: Number(s.finalBalance),
      }));

      setStatements(mapped);
      setCurrentBalance(Number(data.currentBalance ?? 0));
      setPagination(data.pagination);
    } catch (err) {
      setError("Erro ao carregar extratos");
    } finally {
      setLoading(false);
    }
  }

  /* -------------- UPDATE DATE RANGE WHEN PERIOD CHANGES ------------------ */
  useEffect(() => {
    if (selectedPeriod !== "personalizado") {
      const map: Record<string, number> = {
        "7-dias": 7,
        "30-dias": 30,
        "90-dias": 90,
      };
      const days = map[selectedPeriod] ?? 30;
      setDateRange({ from: subDays(new Date(), days), to: new Date() });
      setPagination((p) => ({ ...p, page: 1 }));
    }
  }, [selectedPeriod]);

  /* ----------------------- FETCH ON PARAM CHANGE ------------------------- */
  useEffect(() => {
    fetchStatements();
  }, [dateRange.from, dateRange.to, pagination.page, pagination.limit]);

  /* --------------------------- SUMMARY ----------------------------------- */
  const totalEntradas = statements.reduce(
    (sum, s) => sum + (s.variation > 0 ? s.variation : 0),
    0,
  );
  const totalSaidas = statements.reduce(
    (sum, s) => sum + (s.variation < 0 ? Math.abs(s.variation) : 0),
    0,
  );
  const totalTransacoes = statements.reduce(
    (sum, s) => sum + (s.transactionsCount ?? 0),
    0,
  );

  /* ------------------------------- RENDER -------------------------------- */
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-black">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 space-y-8">
            {/* ---------------------------- HEADER ---------------------------- */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-10 w-10 hover:bg-gray-800/50 transition-all duration-300 rounded-xl border border-gray-800/50 bg-gray-900/50" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Extratos
                  </h1>
                  <p className="text-gray-400">
                    Visualize o histórico detalhado das movimentações
                  </p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </header>

            {/* ---------------------------- FILTERS --------------------------- */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Period selector */}
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="7-dias">Últimos 7 dias</SelectItem>
                      <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="90-dias">Últimos 90 dias</SelectItem>
                      <SelectItem value="personalizado">
                        Personalizado
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Custom range */}
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
                      <PopoverContent
                        className="w-auto p-0 bg-gray-900 border-gray-700"
                        align="end"
                      >
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange({
                              from: range?.from ?? dateRange.from,
                              to: range?.to ?? dateRange.to,
                            });
                            setPagination((p) => ({ ...p, page: 1 }));
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

            {/* ------------------------ SUMMARY CARDS ------------------------ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Saldo */}
              <SummaryCard
                title="Saldo Atual"
                value={currentBalance}
                icon={<Wallet className="w-8 h-8 text-purple-400" />}
                valueClass="text-white"
              />

              {/* Entradas */}
              <SummaryCard
                title="Total Entradas"
                value={totalEntradas}
                icon={<TrendingUp className="w-8 h-8 text-green-400" />}
                valueClass="text-green-400"
              />

              {/* Saídas */}
              <SummaryCard
                title="Total Saídas"
                value={totalSaidas}
                icon={<TrendingDown className="w-8 h-8 text-red-400" />}
                valueClass="text-red-400"
              />

              {/* Contagem transações */}
              <SummaryCard
                title="Transações"
                value={totalTransacoes}
                icon={<FileText className="w-8 h-8 text-blue-400" />}
                valueClass="text-white"
                isInteger
              />
            </div>

            {/* ----------------------- STATEMENT TABLE ----------------------- */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Extrato Diário
                  {loading && (
                    <span className="ml-3 text-xs text-gray-400">
                      Carregando...
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {error && <div className="text-red-400 mb-4">{error}</div>}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        {[
                          "Data",
                          "Saldo Inicial",
                          "Entradas",
                          "Saídas",
                          "Saldo Final",
                          "Transações",
                          "Variação",
                        ].map((h) => (
                          <th
                            key={h}
                            className="py-3 px-4 text-gray-400 font-medium text-left"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {statements.map((s) => {
                        const entradas = s.variation > 0 ? s.variation : 0;
                        const saídas = s.variation < 0 ? -s.variation : 0;

                        return (
                          <tr
                            key={s.id}
                            className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                          >
                            <Td>
                              {format(new Date(s.asOf), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </Td>
                            <Td muted>
                              {formatCurrency(s.initialBalance)}
                            </Td>
                            <Td positive>{formatCurrency(entradas)}</Td>
                            <Td negative>{formatCurrency(saídas)}</Td>
                            <Td bold>{formatCurrency(s.finalBalance)}</Td>
                            <Td>
                              <Badge className="bg-blue-500/20 text-blue-400">
                                {s.transactionsCount}
                              </Badge>
                            </Td>
                            <Td
                              className={`font-semibold ${
                                s.variation >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {s.variation >= 0 ? "+" : "-"}
                              {formatCurrency(Math.abs(s.variation))}
                            </Td>
                          </tr>
                        );
                      })}

                      {!loading && statements.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-gray-400"
                          >
                            Nenhum extrato encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ----------------------- PAGINATION ----------------------- */}
                <div className="flex justify-between mt-4">
                  <Button
                    disabled={pagination.page === 1 || loading}
                    onClick={() =>
                      setPagination((p) => ({
                        ...p,
                        page: Math.max(1, p.page - 1),
                      }))
                    }
                  >
                    Anterior
                  </Button>
                  <span className="text-gray-400 self-center">
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <Button
                    disabled={pagination.page === pagination.pages || loading}
                    onClick={() =>
                      setPagination((p) => ({
                        ...p,
                        page: Math.min(p.pages, p.page + 1),
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

/* -------------------------------------------------------------------------- */
/*                               SUB-COMPONENTS                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  title,
  value,
  icon,
  valueClass,
  isInteger = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueClass: string;
  isInteger?: boolean;
}) {
  return (
    <Card className="bg-gray-900/50 border-gray-800/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${valueClass}`}>
              {isInteger
                ? value.toLocaleString("pt-BR")
                : formatCurrency(value)}
            </p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function Td({
  children,
  muted = false,
  positive = false,
  negative = false,
  bold = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  positive?: boolean;
  negative?: boolean;
  bold?: boolean;
}) {
  const cls = [
    "py-4 px-4",
    muted && "text-gray-300",
    positive && "text-green-400 font-semibold",
    negative && "text-red-400 font-semibold",
    bold && "text-white font-bold",
  ]
    .filter(Boolean)
    .join(" ");

  return <td className={cls}>{children}</td>;
}

function formatCurrency(num: number) {
  return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}
