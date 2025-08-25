"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"

// Dados simplificados
const chartData = {
  week: [
    { name: "Seg", Entradas: 2450, Saidas: 890 },
    { name: "Ter", Entradas: 3200, Saidas: 1200 },
    { name: "Qua", Entradas: 1800, Saidas: 650 },
    { name: "Qui", Entradas: 4100, Saidas: 1500 },
    { name: "Sex", Entradas: 3800, Saidas: 1100 },
    { name: "Sáb", Entradas: 2900, Saidas: 800 },
    { name: "Dom", Entradas: 1600, Saidas: 450 },
  ],
  month: [
    { name: "Sem 1", Entradas: 18500, Saidas: 6200 },
    { name: "Sem 2", Entradas: 22300, Saidas: 7800 },
    { name: "Sem 3", Entradas: 19800, Saidas: 6900 },
    { name: "Sem 4", Entradas: 25600, Saidas: 8400 },
    { name: "Sem 5", Entradas: 12400, Saidas: 4100 },
  ],
  year: [
    { name: "Jan", Entradas: 85000, Saidas: 28000 },
    { name: "Fev", Entradas: 92000, Saidas: 31000 },
    { name: "Mar", Entradas: 78000, Saidas: 26000 },
    { name: "Abr", Entradas: 105000, Saidas: 35000 },
    { name: "Mai", Entradas: 98000, Saidas: 33000 },
    { name: "Jun", Entradas: 112000, Saidas: 38000 },
    { name: "Jul", Entradas: 89000, Saidas: 30000 },
  ],
}

export function BillingChart() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const data = chartData[period]

  // Calcular estatísticas
  const totalEntradas = data.reduce((sum, item) => sum + item.Entradas, 0)
  const totalSaidas = data.reduce((sum, item) => sum + item.Saidas, 0)
  const lucroLiquido = totalEntradas - totalSaidas
  const crescimento =
    data.length > 1 ? ((data[data.length - 1].Entradas - data[0].Entradas) / data[0].Entradas) * 100 : 0

  // Calcular pontos do gráfico
  const maxValue = Math.max(...data.map((d) => Math.max(d.Entradas, d.Saidas)))
  const minValue = Math.min(...data.map((d) => Math.min(d.Entradas, d.Saidas)))
  const range = maxValue - minValue

  const chartWidth = 600
  const chartHeight = 300
  const padding = 40

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (data.length - 1)
  const getY = (value: number) => chartHeight - padding - ((value - minValue) / range) * (chartHeight - 2 * padding)

  const entradasPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.Entradas), value: d.Entradas }))
  const saidasPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.Saidas), value: d.Saidas }))

  // Função para criar curvas suaves usando Catmull-Rom splines
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ""
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
    }

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(i + 2, points.length - 1)]

      const tension = 0.5
      const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension
      const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return path
  }

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredPoint(index)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null)
  }, [])

  const getTooltipPosition = (index: number) => {
    const pointX = getX(index)
    const pointY = Math.min(getY(data[index].Entradas), getY(data[index].Saidas))

    const tooltipWidth = 160
    const tooltipHeight = 100
    const offset = 15

    let tooltipX = pointX - tooltipWidth / 2

    if (tooltipX < padding) {
      tooltipX = padding
    } else if (tooltipX + tooltipWidth > chartWidth - padding) {
      tooltipX = chartWidth - padding - tooltipWidth
    }

    let tooltipY = pointY - tooltipHeight - offset

    if (tooltipY < padding) {
      tooltipY = pointY + offset
    }

    return { x: tooltipX, y: tooltipY }
  }

  return (
    <div className="w-full space-y-6">
      {/* Controles modernos */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-600/20 rounded-xl backdrop-blur-sm border border-purple-500/30">
          <Calendar className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex gap-1 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/50">
          {(["week", "month", "year"] as const).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-300 ${
                period === p
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {p === "week" ? "7 Dias" : p === "month" ? "Mensal" : "Anual"}
            </Button>
          ))}
        </div>
      </div>

      {/* Estatísticas modernas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 backdrop-blur-sm border border-purple-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">Total Entradas</span>
          </div>
          <p className="text-lg font-bold text-white">R$ {totalEntradas.toLocaleString("pt-BR")}</p>
        </div>

        <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 backdrop-blur-sm border border-cyan-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">Total Saídas</span>
          </div>
          <p className="text-lg font-bold text-white">R$ {totalSaidas.toLocaleString("pt-BR")}</p>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">Lucro Líquido</span>
          </div>
          <p className={`text-lg font-bold ${lucroLiquido > 0 ? "text-green-400" : "text-red-400"}`}>
            R$ {lucroLiquido.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-700/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            {crescimento > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className="text-xs text-gray-400 font-medium">Crescimento</span>
          </div>
          <p className={`text-lg font-bold ${crescimento > 0 ? "text-green-400" : "text-red-400"}`}>
            {crescimento > 0 ? "+" : ""}
            {crescimento.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Gráfico moderno */}
      <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-cyan-600/20"></div>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full h-80"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Gradient Definitions */}
            <defs>
              <pattern id="modernGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
              </pattern>

              <linearGradient id="entradasGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
                <stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="saidasGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
                <stop offset="50%" stopColor="#0891B2" stopOpacity="1" />
                <stop offset="100%" stopColor="#67E8F9" stopOpacity="1" />
              </linearGradient>

              <filter id="modernGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="tooltipShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Modern Grid */}
            <rect width="100%" height="100%" fill="url(#modernGrid)" />

            {/* Y Axis Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - padding - ratio * (chartHeight - 2 * padding)
              const value = minValue + ratio * range
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="0.5"
                    opacity="0.4"
                  />
                  <text x={padding - 10} y={y + 4} fill="#9CA3AF" fontSize="11" textAnchor="end" fontWeight="500">
                    {(value / 1000).toFixed(0)}k
                  </text>
                </g>
              )
            })}

            {/* X Axis Labels */}
            {data.map((item, index) => {
              const x = getX(index)
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - 10}
                  fill="#9CA3AF"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {item.name}
                </text>
              )
            })}

            {/* Entradas Line */}
            <path
              d={createSmoothPath(entradasPoints)}
              fill="none"
              stroke="url(#entradasGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#modernGlow)"
              opacity="0.9"
            />

            {/* Saidas Line */}
            <path
              d={createSmoothPath(saidasPoints)}
              fill="none"
              stroke="url(#saidasGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#modernGlow)"
              opacity="0.9"
            />

            {/* Hover areas */}
            {data.map((_, index) => (
              <circle
                key={`hover-area-${index}`}
                cx={getX(index)}
                cy={(getY(data[index].Entradas) + getY(data[index].Saidas)) / 2}
                r="25"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              />
            ))}

            {/* Entradas Points */}
            {entradasPoints.map((point, index) => (
              <circle
                key={`entradas-${index}`}
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "8" : "6"}
                fill="#8B5CF6"
                stroke="#FFFFFF"
                strokeWidth="3"
                className="transition-all duration-200 pointer-events-none"
                style={{
                  filter:
                    hoveredPoint === index
                      ? "drop-shadow(0 0 16px rgba(139, 92, 246, 0.8))"
                      : "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
                }}
              />
            ))}

            {/* Saidas Points */}
            {saidasPoints.map((point, index) => (
              <circle
                key={`saidas-${index}`}
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "8" : "6"}
                fill="#06B6D4"
                stroke="#FFFFFF"
                strokeWidth="3"
                className="transition-all duration-200 pointer-events-none"
                style={{
                  filter:
                    hoveredPoint === index
                      ? "drop-shadow(0 0 16px rgba(6, 182, 212, 0.8))"
                      : "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
                }}
              />
            ))}

            {/* Modern Tooltip */}
            {hoveredPoint !== null &&
              (() => {
                const tooltipPos = getTooltipPosition(hoveredPoint)
                return (
                  <g className="pointer-events-none">
                    {/* Vertical indicator line */}
                    <line
                      x1={getX(hoveredPoint)}
                      y1={padding}
                      x2={getX(hoveredPoint)}
                      y2={chartHeight - padding}
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeDasharray="8,4"
                      opacity="0.6"
                    />

                    {/* Tooltip background */}
                    <g filter="url(#tooltipShadow)">
                      <rect
                        x={tooltipPos.x}
                        y={tooltipPos.y}
                        width="160"
                        height="100"
                        fill="#0F172A"
                        stroke="#334155"
                        strokeWidth="1"
                        rx="16"
                        opacity="0.95"
                      />
                    </g>

                    {/* Tooltip content */}
                    <g>
                      <text
                        x={tooltipPos.x + 80}
                        y={tooltipPos.y + 24}
                        fill="#F1F5F9"
                        fontSize="14"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {data[hoveredPoint].name}
                      </text>

                      <line
                        x1={tooltipPos.x + 20}
                        y1={tooltipPos.y + 32}
                        x2={tooltipPos.x + 140}
                        y2={tooltipPos.y + 32}
                        stroke="#475569"
                        strokeWidth="1"
                      />

                      <circle cx={tooltipPos.x + 25} cy={tooltipPos.y + 48} r="4" fill="#8B5CF6" />
                      <text x={tooltipPos.x + 35} y={tooltipPos.y + 52} fill="#CBD5E1" fontSize="12" fontWeight="500">
                        Entradas
                      </text>
                      <text
                        x={tooltipPos.x + 140}
                        y={tooltipPos.y + 52}
                        fill="#8B5CF6"
                        fontSize="12"
                        textAnchor="end"
                        fontWeight="700"
                      >
                        R$ {(data[hoveredPoint].Entradas / 1000).toFixed(1)}k
                      </text>

                      <circle cx={tooltipPos.x + 25} cy={tooltipPos.y + 68} r="4" fill="#06B6D4" />
                      <text x={tooltipPos.x + 35} y={tooltipPos.y + 72} fill="#CBD5E1" fontSize="12" fontWeight="500">
                        Saídas
                      </text>
                      <text
                        x={tooltipPos.x + 140}
                        y={tooltipPos.y + 72}
                        fill="#06B6D4"
                        fontSize="12"
                        textAnchor="end"
                        fontWeight="700"
                      >
                        R$ {(data[hoveredPoint].Saidas / 1000).toFixed(1)}k
                      </text>

                      <text
                        x={tooltipPos.x + 80}
                        y={tooltipPos.y + 88}
                        fill={data[hoveredPoint].Entradas - data[hoveredPoint].Saidas > 0 ? "#10B981" : "#EF4444"}
                        fontSize="11"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        Lucro: R$ {((data[hoveredPoint].Entradas - data[hoveredPoint].Saidas) / 1000).toFixed(1)}k
                      </text>
                    </g>
                  </g>
                )
              })()}
          </svg>
        </div>

        {/* Modern Legend */}
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full shadow-lg shadow-purple-500/25"></div>
            <span className="text-sm text-gray-300 font-medium">Entradas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full shadow-lg shadow-cyan-500/25"></div>
            <span className="text-sm text-gray-300 font-medium">Saídas</span>
          </div>
        </div>
      </div>

      {/* Info do Período */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Período:{" "}
          <span className="text-white font-medium">
            {period === "week" ? "Últimos 7 dias" : period === "month" ? "Últimas 5 semanas" : "Últimos 7 meses"}
          </span>
          <span className="ml-3 text-green-400 font-medium">✨ Gráfico Modernizado | {data.length} pontos</span>
        </p>
      </div>
    </div>
  )
}
