export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "RD$ 0";
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("DOP", "RD$");
}

/**
 * Single source of truth for the auth token.
 * Remember-me logins store it in localStorage; plain logins in sessionStorage.
 */
export function getAuthToken(): string {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("guru_bot_token") ||
    ""
  );
}

/**
 * Fetch a file from the backend using the stored auth token and return a blob URL.
 * Use this for iframes/embeds to avoid third-party cookie issues in production.
 */
export async function fetchAuthenticatedFile(url: string): Promise<string> {
  const token = getAuthToken();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
