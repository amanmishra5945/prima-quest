import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { adminConfig } from "@/config/adminConfig";
import { z } from "zod";

/**
 * Grants admin role to the current user if their email matches adminConfig.ADMIN_EMAIL.
 * Safe to call on every login.
 */
export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims.email as string | undefined)?.toLowerCase();
    const target = adminConfig.ADMIN_EMAIL.toLowerCase();
    if (!email || email !== target) return { admin: false };

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: context.userId, role: "admin" },
        { onConflict: "user_id,role" },
      );
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("profiles")
      .update({ name: adminConfig.ADMIN_NAME, onboarding_step: 4 })
      .eq("id", context.userId);

    return { admin: true };
  });

/**
 * Grants admin role to the currently signed-in user if they provide the
 * valid admin signup code. Used by the /admin-signup flow.
 */
export const claimAdminWithCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    if (data.code !== adminConfig.ADMIN_SIGNUP_CODE) {
      throw new Error("Invalid admin signup code");
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: context.userId, role: "admin" },
        { onConflict: "user_id,role" },
      );
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("profiles")
      .update({ onboarding_step: 4 })
      .eq("id", context.userId);

    return { admin: true };
  });
