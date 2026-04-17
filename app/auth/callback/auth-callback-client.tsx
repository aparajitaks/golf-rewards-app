"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";

export function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get("next") ?? "/dashboard";
  const code = params?.get("code");
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn("exchangeCodeForSession", error);
            setMessage(error.message);
            router.replace("/login");
            return;
          }
        }
        const { data, error } = await supabase.auth.getUser();
        if (error) console.warn("getUser error after callback", error);
        if (data?.user) router.replace(next);
        else router.replace("/login");
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    })();
  }, [router, next, code]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="rounded-xl border border-border/70 bg-card/80 px-6 py-8 text-center text-sm text-muted-foreground shadow-sm">
        {message}
      </div>
    </div>
  );
}
