export type PrivyOAuthMethod = "apple" | "google";

const allowedMethods = ["apple", "google"] as const;
const configuredMethods = process.env.NEXT_PUBLIC_PRIVY_LOGIN_METHODS ?? "apple";

export const privyLoginMethods = configuredMethods
  .split(",")
  .map((method) => method.trim().toLowerCase())
  .filter((method): method is PrivyOAuthMethod => allowedMethods.includes(method as PrivyOAuthMethod));

export const activePrivyLoginMethods: [PrivyOAuthMethod, ...PrivyOAuthMethod[]] =
  privyLoginMethods.length > 0 ? [privyLoginMethods[0], ...privyLoginMethods.slice(1)] : ["apple"];

export const privyLoginMethodsLabel = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction"
}).format(activePrivyLoginMethods.map((method) => (method === "google" ? "Google" : "Apple")));
