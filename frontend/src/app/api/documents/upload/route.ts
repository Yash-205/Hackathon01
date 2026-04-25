import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const token = req.headers.get("authorization");

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/documents/upload`, {
    method: "POST",
    headers: {
      ...(token ? { "Authorization": token } : {}),
    },
    body: formData,
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
