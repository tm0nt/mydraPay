"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Users, CalendarIcon, Download, Filter } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const vendasData = [
  { mes: "Jan", vendas: 45, valor: 12500, clientes: 38 },
  { mes: "Fev", vendas: 52, valor: 15200, clientes: 42 },
  { mes: "Mar", vendas: 48, valor: 13800, clientes: 40 },
  { mes: "Abr", vendas: 61, valor: 18900, clientes: 51 },
  { mes: "Mai", vendas: 55, valor: 16700, clientes: 47 },
  { mes: "Jun", vendas: 67, valor: 21300, clientes: 58 },
];

const produtosData = [
  { nome: "Produto Digital A", vendas: 156, valor: 15600, participacao: 35 },
  { nome: "Curso Online B", vendas: 89, valor: 26700, participacao: 25 },
  { nome: "Consultoria C", vendas: 34, valor: 17000, participacao: 20 },
  { nome: "E-book D", vendas: 245, valor: 7350, participacao: 12 },
  { nome: "Outros", vendas: 67, valor: 3350, participacao: 8 },
];

const metodosData = [
  { nome: "PIX", valor: 35000, cor: "#8B5CF6" },
  { nome: "Cartão", valor: 28000, cor: "#06B6D4" },
  { nome: "Boleto", valor: 15000, cor: "#F59E0B" },
  { nome: "Transferência", valor: 8000, cor: "#10B981" },
];

const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

export default function RelatorioVendasPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6-meses");
  const [selectedProduct, setSelectedProduct] = useState("todos");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });

  const totalVendas = vendasData.reduce((sum, item) => sum + item.vendas, 0);
  const totalValor = vendasData.reduce((sum, item) => sum + item.valor, 0);
  const totalClientes = vendasData.reduce((sum, item) => sum + item.clientes, 0);
  const ticketMedio = totalValor / totalVendas;

  const crescimentoVendas = vendasData.length > 1 ? 
    ((vendasData[vendasData.length - 1].vendas - vendasData[0].vendas) / vendasData[0].vendas * 100) : 0;

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
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Relatório de Vendas</h1>
                  <p className="text-gray-400">Análise completa do desempenho de vendas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-700/50 hover:bg-gray-800/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
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
                      <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="3-meses">Últimos 3 meses</SelectItem>
                      <SelectItem value="6-meses">Últimos 6 meses</SelectItem>
                      <SelectItem value="1-ano">Último ano</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700/50 text-white">
                      <SelectValue placeholder="Produto" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="todos">Todos os Produtos</SelectItem>
                      <SelectItem value="produto-a">Produto Digital A</SelectItem>
                      <SelectItem value="curso-b">Curso Online B</SelectItem>
                      <SelectItem value="consultoria-c">Consultoria C</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Período Personalizado
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

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total de Vendas</p>
                      <p className="text-2xl font-bold text-white">{totalVendas}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+{crescimentoVendas.toFixed(1)}%</span>
                      </div>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Receita Total</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {totalValor.toLocaleString('pt-BR')}
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
                      <p className="text-gray-400 text-sm">Clientes Únicos</p>
                      <p className="text-2xl font-bold text-white">{totalClientes}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">+12.5%</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Ticket Médio</p>
                      <p className="text-2xl font-bold text-white">
                        R$ {ticketMedio.toFixed(0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">-2.1%</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-sm font-bold">R$</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Trend */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Evolução das Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={vendasData}>
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
                      <Line 
                        type="monotone" 
                        dataKey="vendas" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Receita por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vendasData}>
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
                      <Bar dataKey="valor" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Products and Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {produtosData.map((produto, index) => (
                      <div key={produto.nome} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{produto.nome}</p>
                            <p className="text-gray-400 text-sm">{produto.vendas} vendas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">
                            R$ {produto.valor.toLocaleString('pt-BR')}
                          </p>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {produto.participacao}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="bg-gray-900/50 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Métodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={metodosData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="valor"
                        >
                          {metodosData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {metodosData.map((metodo, index) => (
                      <div key={metodo.nome} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-white">{metodo.nome}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold">
                            R$ {metodo.valor.toLocaleString('pt-BR')}
                          </span>
                          <p className="text-gray-400 text-sm">
                            {((metodo.valor / metodosData.reduce((sum, m) => sum + m.valor, 0)) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
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
