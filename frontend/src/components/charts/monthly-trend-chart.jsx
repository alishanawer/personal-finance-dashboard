import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { convertAmount, formatCurrency } from "@/lib/utils";
import { fallbackColors } from "@/utils/chart-colors";

export default function MonthlyTrendChart({
  data,
  currency,
  fxRates,
  baseCurrency,
}) {
  if (!data.length) {
    return null;
  }

  const chartData = data.map((row) => ({
    ...row,
    income: convertAmount(row.income, {
      rates: fxRates,
      baseCurrency,
      targetCurrency: currency,
    }),
    expense: convertAmount(row.expense, {
      rates: fxRates,
      baseCurrency,
      targetCurrency: currency,
    }),
    net: convertAmount(row.net, {
      rates: fxRates,
      baseCurrency,
      targetCurrency: currency,
    }),
  }));

  return (
    <div className="h-48 md:h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) =>
              formatCurrency(value, currency, {
                rates: fxRates,
                baseCurrency,
              })
            }
            width={90}
          />
          <Tooltip
            formatter={(value) =>
              formatCurrency(value, currency, {
                rates: fxRates,
                baseCurrency,
              })
            }
            contentStyle={{ borderRadius: "8px" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke={fallbackColors.income}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke={fallbackColors.expense}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
