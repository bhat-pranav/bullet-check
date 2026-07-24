export type AnalyzeRequest = {
  jobDescription?: string;
  resume?: string;
};

export type BulletResult = {
  original: string;
  reason: string;
  rewrite: string;
};

export type AnalyzeResponse = {
  results: BulletResult[];
};
