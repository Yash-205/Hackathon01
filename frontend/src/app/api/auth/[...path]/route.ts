import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const contentType = req.headers.get("content-type");
  const body = contentType?.includes("application/x-www-form-urlencoded") 
    ? await req.text() 
    : await req.json();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType || "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const token = req.headers.get("authorization");

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/${path}`, {
    headers: {
      ...(token ? { "Authorization": token } : {}),
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
