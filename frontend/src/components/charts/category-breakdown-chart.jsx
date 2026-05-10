import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { convertAmount, formatCurrency } from "@/lib/utils";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f97316",
  "#7c3aed",
  "#0ea5e9",
  "#ea580c",
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
    <div className="h-64">
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
