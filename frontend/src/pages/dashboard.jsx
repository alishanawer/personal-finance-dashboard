import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryBreakdownChart from "@/components/charts/category-breakdown-chart";

export default function DashboardPage() {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const currency = useStore((state) => state.settings?.currency || "USD");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchTransactions(), fetchCategories()]);
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
  }, [fetchTransactions, fetchCategories]);

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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-10">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Income</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(totals.income, currency)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Expenses</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(totals.expense, currency)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Net Balance</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(totals.net, currency)}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                    No recent transactions yet.
                  </div>
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
                            {formatCurrency(tx.amount, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryTotals.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                    No category data yet.
                  </div>
                ) : (
                  <CategoryBreakdownChart
                    data={categoryTotals}
                    currency={currency}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
