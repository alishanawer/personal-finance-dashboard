import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

const ranges = [
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
  { label: "Last 12 months", value: "365" },
  { label: "All time", value: "all" },
];

export default function ReportsPage() {
  const transactions = useStore((state) => state.transactions);
  const fetchTransactions = useStore((state) => state.fetchTransactions);
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const currency = useStore((state) => state.settings?.currency || "USD");

  const [range, setRange] = useState("90");
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
          setError(err?.detail || err?.message || "Failed to load reports.");
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

  const filteredTransactions = useMemo(() => {
    if (range === "all") return transactions;
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      return new Date(tx.date) >= cutoff;
    });
  }, [transactions, range]);

  const categoryTotals = useMemo(() => {
    const lookup = categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});

    const totals = filteredTransactions.reduce((acc, tx) => {
      const key = tx.category_id
        ? lookup[tx.category_id] || "Uncategorized"
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
  }, [filteredTransactions, categories]);

  const monthlyTotals = useMemo(() => {
    const totals = {};
    filteredTransactions.forEach((tx) => {
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
  }, [filteredTransactions]);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Reports</h1>
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
        </div>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-10">
            Loading reports...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryTotals.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                    No data for this range.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Income</TableHead>
                        <TableHead className="text-right">Expense</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryTotals.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.income, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.expense, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.total, currency)}
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
                <CardTitle>Monthly Totals</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTotals.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                    No data for this range.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Income</TableHead>
                        <TableHead className="text-right">Expense</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyTotals.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.income, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.expense, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(row.net, currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
