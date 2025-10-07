import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    // TODO: Replace with actual API call to validate token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const data = await response.json()

    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error("[v0] Token validation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
