import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryBreakdownChart from "@/components/charts/category-breakdown-chart";
import MonthlyTrendChart from "@/components/charts/monthly-trend-chart";
import { PageHeader } from "@/components/page-header";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { BarChart3 } from "lucide-react";

const ranges = [
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 12 months", value: "365" },
  { label: "All time", value: "all" },
];

export default function DashboardPage() {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const settings = useStore((state) => state.settings);
  const fxRates = useStore((state) => state.fxRates);
  const baseCurrency = settings?.currency || "USD";
  const displayCurrency = settings?.display_currency || baseCurrency;

  const [range, setRange] = useState("90");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (range !== "all") {
          const days = Number(range);
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          params.start_date = cutoff.toISOString();
        }
        await Promise.all([fetchTransactions(params), fetchCategories()]);
      } catch (err) {
        if (isMounted) {
          setError(
            err?.detail || err?.message || "Failed to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchTransactions, fetchCategories, range]);

  const categoryLookup = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") {
          acc.income += tx.amount;
        } else {
          acc.expense += tx.amount;
        }
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 },
    );
  }, [transactions]);

  const transactionCount = useMemo(() => transactions.length, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const aDate = a.date ? new Date(a.date).getTime() : 0;
        const bDate = b.date ? new Date(b.date).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const totals = transactions.reduce((acc, tx) => {
      const key = tx.category_id
        ? categoryLookup[tx.category_id] || "Uncategorized"
        : "Uncategorized";
      if (!acc[key]) {
        acc[key] = { income: 0, expense: 0, total: 0 };
      }
      if (tx.type === "income") {
        acc[key].income += tx.amount;
      } else {
        acc[key].expense += tx.amount;
      }
      acc[key].total = acc[key].income - acc[key].expense;
      return acc;
    }, {});

    return Object.entries(totals).map(([name, values]) => ({
      name,
      ...values,
    }));
  }, [transactions, categoryLookup]);

  const monthlyTotals = useMemo(() => {
    const totals = {};
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!totals[key]) {
        totals[key] = { income: 0, expense: 0 };
      }
      if (tx.type === "income") {
        totals[key].income += tx.amount;
      } else {
        totals[key].expense += tx.amount;
      }
    });

    return Object.entries(totals)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([month, values]) => ({
        month,
        income: values.income,
        expense: values.expense,
        net: values.income - values.expense,
      }));
  }, [transactions]);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Track your income and expenses at a glance"
          actions={
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {ranges.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {isLoading ? (
          <LoadingState message="Loading dashboard..." />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Income</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(totals.income, displayCurrency, {
                    rates: fxRates,
                    baseCurrency,
                  })}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Expenses</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(totals.expense, displayCurrency, {
                    rates: fxRates,
                    baseCurrency,
                  })}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Net Balance</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(totals.net, displayCurrency, {
                    rates: fxRates,
                    baseCurrency,
                  })}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Transactions</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {transactionCount}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <EmptyState
                    icon={BarChart3}
                    title="No recent transactions"
                    description="Start tracking your finances by adding a transaction."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {tx.date
                              ? new Date(tx.date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>{tx.description || "-"}</TableCell>
                          <TableCell>
                            {tx.category_id
                              ? categoryLookup[tx.category_id] || "-"
                              : "-"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {tx.type}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(tx.amount, displayCurrency, {
                              rates: fxRates,
                              baseCurrency,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryTotals.length === 0 ? (
                    <EmptyState
                      icon={BarChart3}
                      title="No category data"
                      description="Create categories and add expenses to see your breakdown."
                    />
                  ) : (
                    <CategoryBreakdownChart
                      data={categoryTotals}
                      currency={displayCurrency}
                      fxRates={fxRates}
                      baseCurrency={baseCurrency}
                    />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyTotals.length === 0 ? (
                    <EmptyState
                      icon={BarChart3}
                      title="No trend data"
                      description="Add transactions to see your monthly trends."
                    />
                  ) : (
                    <MonthlyTrendChart
                      data={monthlyTotals}
                      currency={displayCurrency}
                      fxRates={fxRates}
                      baseCurrency={baseCurrency}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
