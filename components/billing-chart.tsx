"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

// Função para criar curvas suaves (mantida do original)
const createSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length < 2) return "";
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const tension = 0.5;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
};

export function BillingChart() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [hovered, setHovered] = useState<number | null>(null);
  const [data, setData] = useState<{ name: string; Entradas: number; Saidas: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data quando o período muda
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/billing?period=${period}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const fetchedData = await res.json();
        setData(fetchedData);
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [period]);

  // Estatísticas
  const totalEntradas = useMemo(() => data.reduce((sum, item) => sum + item.Entradas, 0), [data]);
  const totalSaidas = useMemo(() => data.reduce((sum, item) => sum + item.Saidas, 0), [data]);
  const lucroLiquido = totalEntradas - totalSaidas;

  // Layout
  const chartWidth = 640;
  const chartHeight = 300;
  const padding = 40;

  const maxValue = Math.max(...data.map((d) => Math.max(d.Entradas, d.Saidas)));
  const minValue = Math.min(...data.map((d) => Math.min(d.Entradas, d.Saidas)));
  const range = maxValue - minValue;

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  const getY = (value: number) => chartHeight - padding - ((value - minValue) / range) * (chartHeight - 2 * padding);

  const entradasPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.Entradas), value: d.Entradas }));
  const saidasPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.Saidas), value: d.Saidas }));

  // Formatadores
  const brlCompact = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }),
    []
  );
  const brlFull = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const handleMouseEnter = useCallback((index: number) => setHovered(index), []);
  const handleMouseLeave = useCallback(() => setHovered(null), []);

  const getTooltipPosition = (index: number) => {
    const pointX = getX(index);
    const pointY = Math.min(getY(data[index].Entradas), getY(data[index].Saidas));
    const tooltipWidth = 160;
    const tooltipHeight = 100;
    const offset = 15;

    let tooltipX = pointX - tooltipWidth / 2;

    if (tooltipX < padding) {
      tooltipX = padding;
    } else if (tooltipX + tooltipWidth > chartWidth - padding) {
      tooltipX = chartWidth - padding - tooltipWidth;
    }

    let tooltipY = pointY - tooltipHeight - offset;

    if (tooltipY < padding) {
      tooltipY = pointY + offset;
    }

    return { x: tooltipX, y: tooltipY };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-gray-400">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Controles */}
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
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {p === "week" ? "7 Dias" : p === "month" ? "Mensal" : "Anual"}
            </Button>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
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
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">Crescimento</span>
          </div>
          <p className={`text-lg font-bold text-blue-400`}>
            +{((lucroLiquido / totalSaidas) * 100).toFixed(1)}%  {/* Exemplo de cálculo; ajuste conforme necessário */}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 relative overflow-hidden">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-80"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
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

          <rect width="100%" height="100%" fill="url(#modernGrid)" />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
            const value = minValue + ratio * range;
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
            );
          })}

          {data.map((item, index) => {
            const x = getX(index);
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
            );
          })}

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

          {entradasPoints.map((point, index) => (
            <circle
              key={`entradas-${index}`}
              cx={point.x}
              cy={point.y}
              r={hovered === index ? "8" : "6"}
              fill="#8B5CF6"
              stroke="#FFFFFF"
              strokeWidth="3"
              className="transition-all duration-200 pointer-events-none"
              style={{
                filter:
                  hovered === index
                    ? "drop-shadow(0 0 16px rgba(139, 92, 246, 0.8))"
                    : "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
              }}
            />
          ))}

          {saidasPoints.map((point, index) => (
            <circle
              key={`saidas-${index}`}
              cx={point.x}
              cy={point.y}
              r={hovered === index ? "8" : "6"}
              fill="#06B6D4"
              stroke="#FFFFFF"
              strokeWidth="3"
              className="transition-all duration-200 pointer-events-none"
              style={{
                filter:
                  hovered === index
                    ? "drop-shadow(0 0 16px rgba(6, 182, 212, 0.8))"
                    : "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
              }}
            />
          ))}

          {hovered !== null &&
            (() => {
              const tooltipPos = getTooltipPosition(hovered);
              return (
                <g className="pointer-events-none">
                  <line
                    x1={getX(hovered)}
                    y1={padding}
                    x2={getX(hovered)}
                    y2={chartHeight - padding}
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.6"
                  />

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

                  <g>
                    <text
                      x={tooltipPos.x + 80}
                      y={tooltipPos.y + 24}
                      fill="#F1F5F9"
                      fontSize="14"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {data[hovered].name}
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
                      R$ {(data[hovered].Entradas / 1000).toFixed(1)}k
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
                      R$ {(data[hovered].Saidas / 1000).toFixed(1)}k
                    </text>

                    <text
                      x={tooltipPos.x + 80}
                      y={tooltipPos.y + 88}
                      fill={data[hovered].Entradas - data[hovered].Saidas > 0 ? "#10B981" : "#EF4444"}
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      Lucro: R$ {((data[hovered].Entradas - data[hovered].Saidas) / 1000).toFixed(1)}k
                    </text>
                  </g>
                </g>
              );
            })()}
        </svg>

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
    </div>
  );
}
