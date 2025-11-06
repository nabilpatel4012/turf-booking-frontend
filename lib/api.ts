const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// For cookie-based authentication, we don't need to manually set Authorization headers
// The browser automatically includes HTTP-only cookies
export function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

// Fetch wrapper that automatically handles credentials and token refresh
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Always include credentials to send cookies
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401 && !url.includes("/refresh-token")) {
    console.log("[Auth] Access token expired, attempting refresh...");

    const refreshResponse = await fetch(getApiUrl("/auth/refresh-token"), {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      console.log("[Auth] Token refreshed successfully, retrying request...");
      response = await fetch(url, fetchOptions);
    } else {
      console.log("[Auth] Refresh failed, user needs to login again");
      // Refresh failed, let the caller handle it
      // (typically redirect to login)
    }
  }

  return response;
}

// Legacy function for backward compatibility
// Use fetchWithAuth instead for new code
export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetchWithAuth(getApiUrl(path), options);
}
