import { NextResponse } from "next/server";

type AnalyzeRequest = {
  jobDescription?: string;
  resume?: string;
};

type BulletResult = {
  original: string;
  reason: string;
  rewrite: string;
};

type AnalyzeResponse = {
  results: BulletResult[];
};

type AnthropicMessageResponse = {
  content?: Array<{ type: string; text?: string }>;
};

const SYSTEM_PROMPT =
  "You are a resume coach. You identify weak resume bullets and rewrite them to be stronger. Always respond in valid JSON only — no markdown, no explanation outside the JSON.";

function buildUserPrompt(jobDescription: string, resume: string): string {
  return `Here is a job description:
<jd>
${jobDescription}
</jd>

Here is a resume:
<resume>
${resume}
</resume>

Identify the 3 weakest resume bullets relative to this job description. For each one return:
- original: the exact bullet as written
- reason: why it is weak (1-2 sentences, specific)
- rewrite: a stronger version that would perform better for this role

Respond ONLY with a JSON object in this exact format:
{
  "results": [
    { "original": "...", "reason": "...", "rewrite": "..." },
    { "original": "...", "reason": "...", "rewrite": "..." },
    { "original": "...", "reason": "...", "rewrite": "..." }
  ]
}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const jobDescription = body.jobDescription?.trim();
  const resume = body.resume?.trim();

  if (!jobDescription || !resume) {
    return NextResponse.json(
      { error: "Both job description and resume are required." },
      { status: 400 },
    );
  }

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(jobDescription, resume),
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the Anthropic API." },
      { status: 502 },
    );
  }

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    return NextResponse.json(
      { error: `Anthropic API error: ${errorText}` },
      { status: anthropicResponse.status },
    );
  }

  let anthropicData: AnthropicMessageResponse;
  try {
    anthropicData = await anthropicResponse.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid response from Anthropic API." },
      { status: 502 },
    );
  }

  const text = anthropicData.content?.[0]?.text;
  if (!text) {
    return NextResponse.json(
      { error: "No content in Anthropic API response." },
      { status: 502 },
    );
  }

  let parsed: AnalyzeResponse;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse analysis results." },
      { status: 502 },
    );
  }

  if (!Array.isArray(parsed.results)) {
    return NextResponse.json(
      { error: "Unexpected analysis format." },
      { status: 502 },
    );
  }

  return NextResponse.json(parsed);
}
