export type VerificationCriterion = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  passed: boolean;
  evidence?: string;
  note?: string;
  updatedAt?: string;
};

export type VerifiedFixSession = {
  id: string;
  projectPath: string;
  task: string;
  criteria: VerificationCriterion[];
  verificationPassed: boolean;
  status: "pending" | "running" | "passed" | "needs-review" | "blocked";
  summary?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.verifiedFixCriteria.v1";
const MAX_SESSIONS = 150;

function readSessions(): VerifiedFixSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const sessions = raw ? JSON.parse(raw) : [];
    return sessions.map((session: VerifiedFixSession) => ({
      ...session,
      status: session.status ?? (session.verificationPassed ? "passed" : "pending"),
    }));
  } catch {
    return [];
  }
}

function writeSessions(sessions: VerifiedFixSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {}
}

function requiredCriteriaPassed(criteria: VerificationCriterion[]) {
  return criteria.every((criterion) => !criterion.required || criterion.passed);
}

export function createVerifiedFixSession(projectPath: string, task: string) {
  const now = new Date().toISOString();

  const criteria: VerificationCriterion[] = [
    {
      id: "target-goal",
      label: "Target behavior satisfied",
      description: "The requested behavior exists after patching.",
      required: true,
      passed: false,
    },
    {
      id: "build-pass",
      label: "Build passes",
      description: "Project verification/build succeeds.",
      required: true,
      passed: false,
    },
    {
      id: "no-regression",
      label: "No obvious regression",
      description: "Previously working behavior remains functional.",
      required: true,
      passed: false,
    },
  ];

  const session: VerifiedFixSession = {
    id: `verified-fix-${Date.now()}`,
    projectPath,
    task,
    criteria,
    verificationPassed: false,
    status: "running",
    summary: "Verification session started.",
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([session, ...readSessions()]);
  return session;
}

export function updateVerificationCriterion(
  sessionId: string,
  criterionId: string,
  passed: boolean,
  detail?: { evidence?: string; note?: string }
) {
  const now = new Date().toISOString();

  const sessions = readSessions().map((session) => {
    if (session.id !== sessionId) return session;

    const criteria = session.criteria.map((criterion) =>
      criterion.id === criterionId
        ? {
            ...criterion,
            passed,
            evidence: detail?.evidence ?? criterion.evidence,
            note: detail?.note ?? criterion.note,
            updatedAt: now,
          }
        : criterion
    );

    const verificationPassed = requiredCriteriaPassed(criteria);

    return {
      ...session,
      criteria,
      verificationPassed,
      status: verificationPassed ? "passed" : session.status === "blocked" ? "blocked" : "running",
      updatedAt: now,
    };
  });

  writeSessions(sessions);
}

export function completeVerifiedFixSession(sessionId: string, passed: boolean, summary: string) {
  const now = new Date().toISOString();
  writeSessions(
    readSessions().map((session) =>
      session.id === sessionId
        ? {
            ...session,
            verificationPassed: passed,
            status: passed ? "passed" : "needs-review",
            summary,
            updatedAt: now,
          }
        : session
    )
  );
}

export function blockVerifiedFixSession(sessionId: string, summary: string) {
  const now = new Date().toISOString();
  writeSessions(
    readSessions().map((session) =>
      session.id === sessionId
        ? {
            ...session,
            verificationPassed: false,
            status: "blocked",
            summary,
            updatedAt: now,
          }
        : session
    )
  );
}

export function getVerifiedFixSession(sessionId: string) {
  return readSessions().find((session) => session.id === sessionId);
}

export function listVerifiedFixSessions(projectPath: string) {
  return readSessions().filter((session) => session.projectPath === projectPath);
}
