"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type ActionState } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signIn,
    null
  );

  return (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none sm:border sm:bg-card sm:shadow-[0_18px_55px_rgba(18,48,35,0.08)]">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-[-0.035em]">Welcome back</CardTitle>
        <CardDescription>Log in to manage today&apos;s orders and deliveries.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
          {state?.error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-brand underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to OrderShune?{" "}
          <Link href="/signup" className="text-brand underline">
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
