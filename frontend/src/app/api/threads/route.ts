import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/threads`, {
    headers: {
      ...(token ? { "Authorization": token } : {}),
    },
  });
  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.headers.get("authorization");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": token } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return Response.json(data, { status: response.status });
}
