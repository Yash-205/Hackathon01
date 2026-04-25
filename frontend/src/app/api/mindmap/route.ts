import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  const json = await req.json();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/mindmap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(json),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Mindmap failed" }));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Connection error" }, { status: 500 });
  }
}
