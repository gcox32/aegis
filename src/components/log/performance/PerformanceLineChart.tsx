'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

interface PerformanceLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  unit?: string;
  title?: string;
  showArea?: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="shadow-lg backdrop-blur-sm px-3 py-2">
        <p className="mb-1 text-muted-foreground text-xs">
          {data.date ? format(new Date(data.date), 'MMM d, yyyy') : ''}
        </p>
        <p className="font-semibold text-foreground text-sm">
          {payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 1 })}{unit}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label formatter for X-axis
const formatXAxisLabel = (tickItem: any) => {
  if (!tickItem) return '';
  try {
    const date = new Date(tickItem);
    return format(date, 'MMM d');
  } catch {
    return '';
  }
};

export function PerformanceLineChart({
  data,
  height = 240,
  color = '#3b82f6',
  unit = '',
  title,
  showArea = true,
}: PerformanceLineChartProps) {
  // Transform data for recharts (needs date as string or timestamp)
  const chartData = data.map((d) => ({
    date: d.date.getTime(),
    value: d.value,
    label: d.label || format(d.date, 'MMM d'),
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-card border border-border rounded-(--radius) text-muted-foreground text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-4 font-display font-semibold text-foreground text-base">
          {title}
        </h3>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisLabel}
                stroke="rgba(255, 255, 255, 0.3)"
                tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                  return value.toLocaleString();
                }}
                stroke="rgba(255, 255, 255, 0.3)"
                tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#gradient-${color.replace('#', '')})`}
                dot={{ fill: color, r: 2 }}
                activeDot={{ r: 4, fill: color }}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxisLabel}
                stroke="rgba(255, 255, 255, 0.3)"
                tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                  return value.toLocaleString();
                }}
                stroke="rgba(255, 255, 255, 0.3)"
                tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={{ fill: color, r: 2 }}
                activeDot={{ r: 4, fill: color }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

