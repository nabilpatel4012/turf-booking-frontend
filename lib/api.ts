const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
      ...options.headers,
    },
  };

  // FIX: If body is FormData, we MUST NOT set Content-Type to application/json
  // In fact, we should remove it if it was passed in options.headers (e.g. from getAuthHeaders)
  // so the browser can set the correct boundary.
  if (options.body instanceof FormData) {
    if ((fetchOptions.headers as any)["Content-Type"]) {
        delete (fetchOptions.headers as any)["Content-Type"];
    }
  } else if (!(options.headers as any)?.["Content-Type"]) {
    // Only set Content-Type to application/json if body is NOT FormData
    // and Content-Type is not already set in options.headers
    (fetchOptions.headers as any)["Content-Type"] = "application/json";
  }

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
      // Optional: window.location.href = "/login";
    }
  }

  return response;
}

// Legacy function
export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetchWithAuth(getApiUrl(path), options);
}

// --- NEW HELPER FUNCTIONS ---

/**
 * Helper for GET requests
 */
export async function get(path: string, options: RequestInit = {}) {
  return fetchWithAuth(getApiUrl(path), {
    ...options,
    method: "GET",
  });
}

/**
 * Helper for POST requests
 * Automatically stringifies the body
 */
export async function post(path: string, data: any, options: RequestInit = {}) {
  return fetchWithAuth(getApiUrl(path), {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Helper for PUT requests
 * Automatically stringifies the body
 */
export async function put(path: string, data: any, options: RequestInit = {}) {
  return fetchWithAuth(getApiUrl(path), {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Helper for DELETE requests
 */
export async function del(path: string, options: RequestInit = {}) {
  return fetchWithAuth(getApiUrl(path), {
    ...options,
    method: "DELETE",
  });
}

/**
 * Logout current admin user
 * Clears session and cookies
 */
export async function logout(): Promise<boolean> {
  const response = await fetchWithAuth(getApiUrl("/auth/admin/logout"), {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
}