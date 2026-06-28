"use client";

import { useState } from "react";

type BulletResult = {
  original: string;
  reason: string;
  rewrite: string;
};

type AnalyzeResponse = {
  results: BulletResult[];
};

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulletResult[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResults((data as AnalyzeResponse).results);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const textareaClassName =
    "textarea-dark-scrollbar w-full resize-y rounded-md border border-[#2e2e2e] bg-[#141414] px-3 py-2.5 text-[15px] leading-relaxed text-[#ededed] placeholder:text-[#555] focus:border-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-white/10";

  return (
    <div className="min-h-full bg-[#0a0a0a] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[#ededed] antialiased">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">
            Bullet Check
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#ededed]">
            Paste a job description and your resume. Get back your 3 weakest
            bullets and stronger rewrites.
          </p>
          <p className="mt-2 text-sm text-[#ededed]">
            Paste both inputs, hit "Analyze", and results appear below.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="job-description"
              className="mb-2 block text-sm font-medium text-[#ededed]"
            >
              Job Description
            </label>
            <textarea
              id="job-description"
              rows={10}
              className={textareaClassName}
              placeholder="Paste the full job posting including responsibilities and requirements."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="resume"
              className="mb-2 block text-sm font-medium text-[#ededed]"
            >
              Resume
            </label>
            <textarea
              id="resume"
              rows={10}
              className={textareaClassName}
              placeholder="Paste your full resume as plain text including all sections, not just bullets."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className={loading ? "animate-pulse" : undefined}>
              {loading ? "Analyzing..." : "Analyze"}
            </span>
          </button>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </form>

        {results && (
          <section className="mt-12 space-y-4">
            <h2 className="text-sm font-medium text-[#ededed]">Results</h2>
            {results.map((result, index) => (
              <article
                key={index}
                className="rounded-lg border border-[#2e2e2e] bg-[#141414] px-5 py-5"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#ededed]">
                    Original
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#ededed]">
                    {result.original}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#ededed]">
                    Why it&apos;s weak
                  </p>
                  <p className="mt-1.5 text-[15px] italic leading-relaxed text-[#888]">
                    {result.reason}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#ededed]">
                    Stronger rewrite
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[#ededed]">
                    {result.rewrite}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
