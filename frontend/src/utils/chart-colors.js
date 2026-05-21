// Chart colors that respect light/dark theme
// Using CSS variable fallbacks for theme-aware colors

export const chartColors = {
  // Income colors (green spectrum)
  income: "hsl(var(--chart-2))",
  income1: "hsl(var(--chart-2))",

  // Expense colors (red spectrum)
  expense: "hsl(var(--chart-3))",
  expense1: "hsl(var(--chart-3))",

  // Alternative colors for multi-category charts
  alt1: "hsl(var(--chart-1))",
  alt2: "hsl(var(--chart-4))",
  alt3: "hsl(var(--chart-5))",
  alt4: "hsl(var(--primary))",
  alt5: "hsl(var(--accent))",
};

// Fallback hex colors (for SSR or CSS-in-JS where variables aren't available)
export const fallbackColors = {
  income: "#16a34a",      // Green
  expense: "#dc2626",      // Red
  alt1: "#2563eb",         // Blue
  alt2: "#f97316",         // Orange
  alt3: "#7c3aed",         // Purple
  alt4: "#0ea5e9",         // Cyan
  alt5: "#ea580c",         // Darker Orange
};

// Get color by index (for cycling through colors in charts)
export function getChartColor(index) {
  const colors = [
    chartColors.income,
    chartColors.alt1,
    chartColors.alt2,
    chartColors.alt3,
    chartColors.alt4,
  ];
  return colors[index % colors.length];
}

// Get fallback color by index
export function getFallbackChartColor(index) {
  const colors = [
    fallbackColors.income,
    fallbackColors.alt1,
    fallbackColors.alt2,
    fallbackColors.alt3,
    fallbackColors.alt4,
  ];
  return colors[index % colors.length];
}
