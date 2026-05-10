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

const CURRENCY_OPTIONS = [
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "PKR", label: "PKR - Pakistani Rupee" },
  { code: "AED", label: "AED - UAE Dirham" },
  { code: "SAR", label: "SAR - Saudi Riyal" },
  { code: "INR", label: "INR - Indian Rupee" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "CNY", label: "CNY - Chinese Yuan" },
];

export default function SettingsPage() {
  const settings = useStore((state) => state.settings);
  const fetchSettings = useStore((state) => state.fetchSettings);
  const updateSettings = useStore((state) => state.updateSettings);
  const fetchFxRates = useStore((state) => state.fetchFxRates);
  const user = useStore((state) => state.auth.user);
  const fetchProfile = useStore((state) => state.fetchProfile);
  const updateProfile = useStore((state) => state.updateProfile);

  const [form, setForm] = useState({
    currency: "",
    display_currency: "",
    theme: "",
    email_notifications: true,
    budget_alerts: true,
    weekly_summary: false,
  });
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const applySettings = (data) => {
      if (!isMounted || !data) return;
      setForm({
        currency: data.currency || "USD",
        display_currency: data.display_currency || data.currency || "USD",
        theme: data.theme || "light",
        email_notifications: data.email_notifications ?? true,
        budget_alerts: data.budget_alerts ?? true,
        weekly_summary: data.weekly_summary ?? false,
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
        const [res] = await Promise.all([fetchSettings(), fetchProfile()]);
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
  }, [fetchProfile, fetchSettings, settings]);

  useEffect(() => {
    if (!form.currency) return;
    fetchFxRates(
      form.currency,
      CURRENCY_OPTIONS.map((item) => item.code),
    ).catch((err) => {
      toast.error(err?.message || "Failed to fetch exchange rates.");
    });
  }, [fetchFxRates, form.currency]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      username: user.username || "",
      email: user.email || "",
    });
  }, [user]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await updateSettings({
        currency: form.currency || "USD",
        display_currency: form.display_currency || form.currency || "USD",
        theme: form.theme || "light",
        email_notifications: form.email_notifications,
        budget_alerts: form.budget_alerts,
        weekly_summary: form.weekly_summary,
      });
      toast.success("Settings updated.");
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to update settings.");
      toast.error(err?.detail || err?.message || "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setError(null);
    setIsProfileSaving(true);
    try {
      const payload = {};
      const username = profileForm.username.trim();
      const email = profileForm.email.trim();

      if (username) payload.username = username;
      if (email) payload.email = email;

      if (!Object.keys(payload).length) {
        toast.error("Please provide a username or email.");
        return;
      }

      await updateProfile(payload);
      toast.success("Profile updated.");
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to update profile.");
      toast.error(err?.detail || err?.message || "Failed to update profile.");
    } finally {
      setIsProfileSaving(false);
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
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    Profile
                  </h2>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      placeholder="Username"
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleProfileSave}
                    disabled={isProfileSaving}>
                    {isProfileSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
                <div className="h-px w-full bg-border" />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Currency</label>
                  <Select
                    value={form.currency}
                    onValueChange={(val) =>
                      setForm({
                        ...form,
                        currency: val,
                        display_currency: form.display_currency || val,
                      })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select base currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Display Currency
                  </label>
                  <Select
                    value={form.display_currency}
                    onValueChange={(val) =>
                      setForm({
                        ...form,
                        display_currency: val,
                      })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select display currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    Notifications
                  </h2>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-muted"
                      checked={form.email_notifications}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email_notifications: e.target.checked,
                        })
                      }
                    />
                    Email notifications
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-muted"
                      checked={form.budget_alerts}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          budget_alerts: e.target.checked,
                        })
                      }
                    />
                    Budget alerts
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-muted"
                      checked={form.weekly_summary}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          weekly_summary: e.target.checked,
                        })
                      }
                    />
                    Weekly summary
                  </label>
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
