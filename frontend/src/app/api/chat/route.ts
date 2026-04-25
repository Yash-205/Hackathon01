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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/chat`, {
      method: "POST",
      headers,
      body: requestBody,
    });

    console.log(`[PROXY] Backend responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown backend error" }));
      console.error("[PROXY] Backend Error:", errorData);
      return Response.json(errorData, { status: response.status });
    }

    const text = await response.text();

    // Handle the legacy 0: streaming format if detected
    if (text.includes("\n0:") || text.startsWith("0:") || text.startsWith("2:")) {
      const content = text.split('\n')
        .filter(line => line.startsWith('0:'))
        .map(line => {
          try {
            return JSON.parse(line.substring(2));
          } catch (e) {
            return "";
          }
        })
        .join('');
      
      return Response.json({
        id: "legacy_stream_" + Date.now(),
        role: "assistant",
        content: content || "Response received but could not be parsed."
      });
    }

    // Otherwise, try to parse as regular JSON
    try {
      const data = JSON.parse(text);
      return Response.json(data);
    } catch (e) {
      console.error("[PROXY] Failed to parse backend response as JSON:", e);
      return Response.json({ error: "Invalid response from backend" }, { status: 500 });
    }
  } catch (error) {
    console.error("[PROXY] Fetch Error:", error);
    return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
