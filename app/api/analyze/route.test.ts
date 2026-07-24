import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("returns 500 when ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await POST(makeRequest({ jobDescription: "a", resume: "b" }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("returns 400 when jobDescription or resume is missing", async () => {
    const response = await POST(makeRequest({ jobDescription: "" , resume: "b" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/required/);
  });

  it("returns the parsed results on a successful Anthropic response", async () => {
    const results = [
      { original: "Did stuff", reason: "Too vague", rewrite: "Shipped X, improving Y by Z%" },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            content: [{ type: "text", text: JSON.stringify({ results }) }],
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await POST(makeRequest({ jobDescription: "jd", resume: "resume" }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual(results);
  });

  it("returns 502 when Anthropic's response text isn't valid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            content: [{ type: "text", text: "not json" }],
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await POST(makeRequest({ jobDescription: "jd", resume: "resume" }));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toMatch(/Failed to parse/);
  });

  it("propagates the Anthropic API's error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("rate limited", { status: 429 })),
    );

    const response = await POST(makeRequest({ jobDescription: "jd", resume: "resume" }));

    expect(response.status).toBe(429);
  });
});
