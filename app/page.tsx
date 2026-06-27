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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Bullet Check</h1>
        <p className="mt-2 text-gray-600">
          Paste a job description and your resume. Get back your 3 weakest
          bullets — and better versions.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="job-description" className="mb-1 block font-medium">
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={8}
            className="w-full rounded border border-gray-300 p-3 text-sm"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="resume" className="mb-1 block font-medium">
            Resume
          </label>
          <textarea
            id="resume"
            rows={12}
            className="w-full rounded border border-gray-300 p-3 text-sm"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && (
        <div className="mt-8 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {results && (
        <section className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold">Results</h2>
          {results.map((result, index) => (
            <article
              key={index}
              className="rounded border border-gray-200 p-4 text-sm"
            >
              <p className="font-medium">Original</p>
              <p className="mt-1 text-gray-800">{result.original}</p>

              <p className="mt-4 font-medium">Why it&apos;s weak</p>
              <p className="mt-1 text-gray-600">{result.reason}</p>

              <p className="mt-4 font-medium">Stronger rewrite</p>
              <p className="mt-1 text-gray-800">{result.rewrite}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
