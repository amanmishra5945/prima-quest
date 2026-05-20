/**
 * Admin configuration.
 * Change these values to change the admin profile. The first time the user
 * with ADMIN_EMAIL signs in, the system grants them the "admin" role
 * automatically via the `ensureAdminRole` server function.
 *
 * To change the admin password, simply register a new account with this
 * email (or reset the password via the dashboard).
 */
export const adminConfig = {
  ADMIN_EMAIL: "admin@primainterns.com",
  ADMIN_NAME: "Prima Admin",
  // Default password used only when prompting you to register the admin
  // account for the first time. Change after registering.
  ADMIN_DEFAULT_PASSWORD: "Admin@12345",
};
