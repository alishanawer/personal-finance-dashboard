import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { convertAmount, formatCurrency } from "@/lib/utils";
import { fallbackColors, getChartColor } from "@/utils/chart-colors";

// Use fallback colors that respect the design system
const COLORS = [
  fallbackColors.alt1,    // Blue
  fallbackColors.income,  // Green
  fallbackColors.expense, // Red
  fallbackColors.alt2,    // Orange
  fallbackColors.alt3,    // Purple
  fallbackColors.alt4,    // Cyan
  fallbackColors.alt5,    // Dark Orange
];

export default function CategoryBreakdownChart({
  data,
  currency,
  fxRates,
  baseCurrency,
}) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: Math.abs(
      convertAmount(item.expense || 0, {
        rates: fxRates,
        baseCurrency,
        targetCurrency: currency,
      }),
    ),
    fill: COLORS[index % COLORS.length],
  }));

  if (!chartData.length) {
    return null;
  }

  return (
    <div className="h-48 md:h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              formatCurrency(value, currency, {
                rates: fxRates,
                baseCurrency,
              })
            }
            contentStyle={{ borderRadius: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
