const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`
}
