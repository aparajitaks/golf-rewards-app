"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const oauthError = useMemo(() => params?.get("error_description") ?? params?.get("error"), [params]);

  useEffect(() => {
    (async () => {
      const code = params?.get("code");
      if (!code) {
        setSessionReady(true);
        return;
      }
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) setError(error.message);
      setSessionReady(true);
    })();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!password) {
      setError("Please enter a new password.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated. Redirecting to login…");
      setTimeout(() => router.replace("/login"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">New password</CardTitle>
          <CardDescription>Choose a strong password you have not used elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          {!sessionReady ? (
            <p className="text-sm text-muted-foreground">Preparing secure session…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required autoComplete="new-password" />
              </div>
              {(oauthError || error) && <p className="text-sm text-destructive">{oauthError ?? error}</p>}
              {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Updating…" : "Set password"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              ← Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
