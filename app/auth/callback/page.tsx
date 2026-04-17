import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-muted-foreground">Signing you in…</div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
