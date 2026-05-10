import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import useStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const settings = useStore((state) => state.settings);
  const fetchSettings = useStore((state) => state.fetchSettings);
  const updateSettings = useStore((state) => state.updateSettings);

  const [form, setForm] = useState({ currency: "", theme: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const applySettings = (data) => {
      if (!isMounted || !data) return;
      setForm({
        currency: data.currency || "USD",
        theme: data.theme || "light",
      });
      setIsLoading(false);
    };

    if (settings) {
      applySettings(settings);
      return () => {
        isMounted = false;
      };
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchSettings();
        applySettings(res ?? settings);
      } catch (err) {
        if (isMounted) {
          setError(err?.detail || err?.message || "Failed to load settings.");
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchSettings, settings]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await updateSettings({
        currency: form.currency || "USD",
        theme: form.theme || "light",
      });
      toast.success("Settings updated.");
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to update settings.");
      toast.error(err?.detail || err?.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {isLoading ? (
              <div className="text-center text-muted-foreground py-10">
                Loading settings...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Default Currency
                  </label>
                  <Input
                    placeholder="USD"
                    value={form.currency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <Select
                    value={form.theme}
                    onValueChange={(val) => setForm({ ...form, theme: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
