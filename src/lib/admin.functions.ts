import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { adminConfig } from "@/config/adminConfig";

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

    // Upsert admin role
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: context.userId, role: "admin" },
        { onConflict: "user_id,role" },
      );
    if (error) throw new Error(error.message);

    // Update profile name to admin display name
    await supabaseAdmin
      .from("profiles")
      .update({ name: adminConfig.ADMIN_NAME, onboarding_step: 4 })
      .eq("id", context.userId);

    return { admin: true };
  });
