import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  const contentType = req.headers.get("content-type") || "";
  let requestBody: any;
  const headers: Record<string, string> = {
    ...(token ? { "Authorization": token } : {}),
  };

  console.log(`[PROXY] Incoming ${contentType} request`);

  if (contentType.includes("multipart/form-data")) {
    requestBody = await req.formData();
    console.log("[PROXY] Handling Multipart Form Data");
  } else {
    try {
      const json = await req.json();
      requestBody = JSON.stringify(json);
      headers["Content-Type"] = "application/json";
      console.log("[PROXY] Handling JSON Data:", json.messages?.[json.messages.length - 1]?.content);
    } catch (e) {
      console.log("[PROXY] Empty or invalid JSON body");
      requestBody = JSON.stringify({});
      headers["Content-Type"] = "application/json";
    }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/chat`, {
      method: "POST",
      headers,
      body: requestBody,
    });

    console.log(`[PROXY] Backend responded with status: ${response.status}`);

    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[PROXY] Backend Error Data:", errorData);
      return Response.json(errorData, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (error) {
    console.error("[PROXY] Fetch Error:", error);
    return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
