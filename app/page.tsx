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
    "w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

  return (
    <div className="min-h-full bg-white font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-neutral-900 antialiased">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Bullet Check
          </h1>
          <p className="mt-3 text-base leading-relaxed text-neutral-600">
            Paste a job description and your resume. Get back your 3 weakest
            bullets and stronger rewrites.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Paste both inputs, hit "Analyze", and results appear below.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="job-description"
              className="mb-2 block text-sm font-medium text-neutral-700"
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
              className="mb-2 block text-sm font-medium text-neutral-700"
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
            className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
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
            <h2 className="text-sm font-medium text-neutral-500">Results</h2>
            {results.map((result, index) => (
              <article
                key={index}
                className="rounded-lg bg-[#f5f5f5] px-5 py-5"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Original
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-900">
                    {result.original}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Why it&apos;s weak
                  </p>
                  <p className="mt-1.5 text-[15px] italic leading-relaxed text-neutral-600">
                    {result.reason}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Stronger rewrite
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-neutral-900">
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
