/**
 * Runtime proxy — forwards all /api/v1/* requests to the backend.
 * process.env.BACKEND_URL is read at request time (not build time),
 * so Railway's runtime env var is always used.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND}/api/v1/${path}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      // Pass through as-is for file uploads
      const formData = await req.formData();
      const resp = await fetch(targetUrl, {
        method: req.method,
        body: formData,
      });
      const data = await resp.json().catch(() => null);
      return NextResponse.json(data, { status: resp.status });
    }
    body = await req.text();
  }

  const resp = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const data = await resp.json().catch(() => null);
  return NextResponse.json(data, { status: resp.status });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
