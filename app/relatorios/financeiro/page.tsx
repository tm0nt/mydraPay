"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, PieChart, Download, CalendarIcon } from 'lucide-react';

const fluxoCaixaData = [
  { mes: "Jan", entradas: 45000, saidas: 32000, saldo: 13000 },
  { mes: "Fev", entradas: 52000, saidas: 38000, saldo: 14000 },
  { mes: "Mar", entradas: 48000, saidas: 35000, saldo: 13000 },
  { mes: "Abr", entradas: 61000, saidas: 42000, saldo: 19000 },
  { mes: "Mai", entradas: 55000, saidas: 39000, saldo: 16000 },
  { mes: "Jun", entradas: 67000, saidas: 45000, saldo: 22000 },
];

const categoriasGastos = [
  { categoria: "Taxas de Processamento", valor: 8500, percentual: 35, cor: "#EF4444" },
  { categoria: "Marketing", valor: 6200, percentual: 26, cor: "#F59E0B" },
  { categoria: "Operacional", valor: 4800, percentual: 20, cor: "#8B5CF6" },
  { categoria: "Impostos", valor: 2900, percentual: 12, cor: "#06B6D4" },
  { categoria: "Outros", valor: 1600, percentual: 7, cor: "#10B981" },
];

const indicadoresData = [
  { nome: "ROI", valor: 245, unidade: "%", variacao: 12.5, positiva: true },
  { nome: "Margem Líquida", valor: 28.5, unidade: "%", variacao: -2.1, positiva: false },
  { nome: "Custo de Aquisição", valor: 45, unidade: "R$", variacao: -8.3, positiva: true },
  { nome: "LTV", valor: 1250, unidade: "R$", variacao: 15.7, positiva: true },
];

export default function RelatorioFinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6-meses");

  const totalEntradas = fluxoCaixaData.reduce((sum, item) => sum + item.entradas, 0);
  const totalSaidas = fluxoCaixaData.reduce((sum, item) => sum + item.saidas, 0);
  const saldoLiquido = totalEntradas - totalSaidas;
  const margemLiquida = (saldoLiquido / totalEntradas) * 100;

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Relatório Financeiro</h1>
                  <p className="text-gray-400">Análise detalhada da saúde financeira</p>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </header>

            {/* Period Filter */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CalendarIcon className="w-5 h-5 text-purple-400" />
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="3-meses">Últimos 3 meses</SelectItem>
                      <SelectItem value="6-meses">Últimos 6 meses</SelectItem>
                      <SelectItem value="1-ano">Último ano</SelectItem>
                      <SelectItem value="2-anos">Últimos 2 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Receita Total</p>
                      <p className="text-2xl font-bold text-green-400">
                        R$ {totalEntradas.toLocaleString('pt-BR')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+18.2%</span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Despesas Totais</p>
                      <p className="text-2xl font-bold text-red-400">
                        R$ {totalSaidas.toLocaleString('pt-BR')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">+12.5%</span>
                      </div>
                    </div>
                    <CreditCard className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Lucro Líquido</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {saldoLiquido.toLocaleString('pt-BR')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+25.8%</span>
                      </div>
                    </div>
                    <Wallet className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Margem Líquida</p>
                      <p className="text-2xl font-bold text-white">
                        {margemLiquida.toFixed(1)}%
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+3.2%</span>
                      </div>
                    </div>
                    <PieChart className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Chart */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={fluxoCaixaData}>
                    <defs>
                      <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mes" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="entradas" 
                      stackId="1"
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorEntradas)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="saidas" 
                      stackId="2"
                      stroke="#EF4444" 
                      fillOpacity={1} 
                      fill="url(#colorSaidas)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Categories */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Categorias de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoriasGastos.map((categoria, index) => (
                      <div key={categoria.categoria} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{categoria.categoria}</span>
                          <div className="text-right">
                            <span className="text-white font-semibold">
                              R$ {categoria.valor.toLocaleString('pt-BR')}
                            </span>
                            <p className="text-gray-400 text-sm">{categoria.percentual}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${categoria.percentual}%`,
                              backgroundColor: categoria.cor
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Indicators */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Indicadores Financeiros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {indicadoresData.map((indicador) => (
                      <div key={indicador.nome} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div>
                          <p className="text-white font-semibold">{indicador.nome}</p>
                          <p className="text-gray-400 text-sm">
                            {indicador.nome === "ROI" ? "Retorno sobre Investimento" :
                             indicador.nome === "Margem Líquida" ? "Margem de Lucro Líquida" :
                             indicador.nome === "Custo de Aquisição" ? "CAC - Custo de Aquisição de Cliente" :
                             "LTV - Lifetime Value"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {indicador.unidade === "R$" ? "R$ " : ""}{indicador.valor}
                            {indicador.unidade === "%" ? "%" : ""}
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            {indicador.positiva ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm ${indicador.positiva ? 'text-green-400' : 'text-red-400'}`}>
                              {indicador.positiva ? '+' : ''}{indicador.variacao}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Comparison */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Comparativo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fluxoCaixaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mes" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="entradas" fill="#10B981" name="Entradas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" fill="#EF4444" name="Saídas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
