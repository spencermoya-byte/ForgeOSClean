export type GitDiffReviewStatus = "pending" | "approved" | "rejected" | "applied";

export type GitDiffReview = {
  id: string;
  projectPath: string;
  filePath: string;
  summary: string;
  diffPreview: string;
  status: GitDiffReviewStatus;
  source: "builder" | "manual" | "recovery";
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.gitDiffReview.v1";
const MAX_REVIEWS = 300;

function readReviews(): GitDiffReview[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeReviews(reviews: GitDiffReview[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews.slice(0, MAX_REVIEWS)));
  } catch {}
}

export function createGitDiffReview(
  projectPath: string,
  filePath: string,
  summary: string,
  diffPreview: string,
  source: GitDiffReview["source"] = "builder"
) {
  const now = new Date().toISOString();

  const review: GitDiffReview = {
    id: `diff-review-${Date.now()}`,
    projectPath,
    filePath,
    summary,
    diffPreview,
    status: "pending",
    source,
    createdAt: now,
    updatedAt: now,
  };

  writeReviews([review, ...readReviews()]);
  return review;
}

export function updateGitDiffReview(
  reviewId: string,
  status: GitDiffReviewStatus
) {
  const now = new Date().toISOString();

  writeReviews(
    readReviews().map((review) =>
      review.id === reviewId
        ? { ...review, status, updatedAt: now }
        : review
    )
  );
}

export function listGitDiffReviews(projectPath: string) {
  return readReviews().filter((review) => review.projectPath === projectPath);
}
