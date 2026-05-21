import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

const search = z.object({
  email: z.string().email().optional().catch(undefined),
  next: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
  validateSearch: (s) => search.parse(s),
});

function VerifyEmail() {
  const nav = useNavigate();
  const { email: initialEmail, next } = useSearch({ from: "/verify-email" });
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || code.length < 6) {
      toast.error("Enter your email and the 6-digit code");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Email verified! You can now sign in.");
    await supabase.auth.signOut();
    nav({ to: next ?? "/login" });
  };

  const resend = async () => {
    if (!email) return toast.error("Enter your email first");
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Verification code re-sent. Check your inbox.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Verify your email</div>
            <div className="text-xs text-muted-foreground">Prima Interns</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Enter verification code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to your email. Enter it below to activate your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              required
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="tracking-[0.5em] text-center font-mono text-lg"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify email"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="text-primary hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
          <Link to={next ?? "/login"} className="text-muted-foreground hover:text-foreground">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
