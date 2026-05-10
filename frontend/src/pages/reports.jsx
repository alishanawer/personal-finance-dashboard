import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import CategoryBreakdownChart from "@/components/charts/category-breakdown-chart";
import MonthlyTrendChart from "@/components/charts/monthly-trend-chart";

const SAVED_REPORTS_KEY = "reports:saved";

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
  const [savedReports, setSavedReports] = useState([]);
  const [reportName, setReportName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(SAVED_REPORTS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedReports(parsed);
        }
      } catch (err) {
        setSavedReports([]);
      }
    }
  }, []);

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

  const filterTransactionsByRange = (rangeValue, offsetDays = 0) => {
    if (rangeValue === "all") return transactions;
    const days = Number(rangeValue);
    const end = new Date();
    end.setDate(end.getDate() - offsetDays);
    const start = new Date();
    start.setDate(start.getDate() - offsetDays - days);
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const date = new Date(tx.date);
      return date >= start && date < end;
    });
  };

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByRange(range);
  }, [transactions, range]);

  const comparisonTransactions = useMemo(() => {
    if (range === "all") return [];
    const days = Number(range);
    return filterTransactionsByRange(range, days);
  }, [transactions, range]);

  const summaryTotals = useMemo(() => {
    return filteredTransactions.reduce(
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
  }, [filteredTransactions]);

  const comparisonTotals = useMemo(() => {
    if (range === "all") return null;
    return comparisonTransactions.reduce(
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
  }, [comparisonTransactions, range]);

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

  const handleSaveReport = () => {
    const name = reportName.trim();
    if (!name) return;
    const next = [
      ...savedReports.filter((item) => item.name !== name),
      {
        name,
        range,
      },
    ];
    setSavedReports(next);
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next));
    setReportName("");
  };

  const handleDeleteReport = (name) => {
    const next = savedReports.filter((item) => item.name !== name);
    setSavedReports(next);
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(next));
  };

  const handleDownloadCsv = (filename, rows) => {
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportTransactionsCsv = () => {
    const lookup = categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...filteredTransactions.map((tx) => [
        tx.date ? new Date(tx.date).toISOString().slice(0, 10) : "",
        tx.description ? `"${tx.description.replace(/"/g, '""')}"` : "",
        tx.category_id ? lookup[tx.category_id] || "" : "",
        tx.type,
        String(tx.amount),
      ]),
    ];
    handleDownloadCsv("transactions-report.csv", rows);
  };

  const exportCategoryCsv = () => {
    const rows = [
      ["Category", "Income", "Expense", "Net"],
      ...categoryTotals.map((row) => [
        `"${row.name.replace(/"/g, '""')}"`,
        String(row.income),
        String(row.expense),
        String(row.total),
      ]),
    ];
    handleDownloadCsv("category-summary.csv", rows);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <div className="flex flex-wrap items-center gap-3">
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
            <Button variant="outline" onClick={exportTransactionsCsv}>
              Export Transactions
            </Button>
            <Button variant="outline" onClick={exportCategoryCsv}>
              Export Category Summary
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleSaveReport} disabled={!reportName.trim()}>
                Save Current
              </Button>
            </div>
            {savedReports.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No saved reports yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {savedReports.map((report) => (
                  <div key={report.name} className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRange(report.range)}>
                      {report.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(report.name)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Income</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(summaryTotals.income, currency)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Expenses</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(summaryTotals.expense, currency)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Net Total</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatCurrency(summaryTotals.net, currency)}
                </CardContent>
              </Card>
            </div>
            {comparisonTotals ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Previous</CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg font-semibold">
                    {formatCurrency(
                      summaryTotals.income - comparisonTotals.income,
                      currency,
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Expense vs Previous</CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg font-semibold">
                    {formatCurrency(
                      summaryTotals.expense - comparisonTotals.expense,
                      currency,
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Net vs Previous</CardTitle>
                  </CardHeader>
                  <CardContent className="text-lg font-semibold">
                    {formatCurrency(
                      summaryTotals.net - comparisonTotals.net,
                      currency,
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
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
                    <div className="space-y-6">
                      <CategoryBreakdownChart
                        data={categoryTotals}
                        currency={currency}
                      />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Income</TableHead>
                            <TableHead className="text-right">
                              Expense
                            </TableHead>
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
                    </div>
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
                    <div className="space-y-6">
                      <MonthlyTrendChart
                        data={monthlyTotals}
                        currency={currency}
                      />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead className="text-right">Income</TableHead>
                            <TableHead className="text-right">
                              Expense
                            </TableHead>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
