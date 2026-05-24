export type VerificationCriterion = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  passed: boolean;
};

export type VerifiedFixSession = {
  id: string;
  projectPath: string;
  task: string;
  criteria: VerificationCriterion[];
  verificationPassed: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "vivus.verifiedFixCriteria.v1";

function readSessions(): VerifiedFixSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: VerifiedFixSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
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
    createdAt: now,
    updatedAt: now,
  };

  writeSessions([session, ...readSessions()]);
  return session;
}

export function updateVerificationCriterion(
  sessionId: string,
  criterionId: string,
  passed: boolean
) {
  const now = new Date().toISOString();

  const sessions = readSessions().map((session) => {
    if (session.id !== sessionId) return session;

    const criteria = session.criteria.map((criterion) =>
      criterion.id === criterionId
        ? { ...criterion, passed }
        : criterion
    );

    return {
      ...session,
      criteria,
      verificationPassed: criteria.every(
        (criterion) => !criterion.required || criterion.passed
      ),
      updatedAt: now,
    };
  });

  writeSessions(sessions);
}

export function listVerifiedFixSessions(projectPath: string) {
  return readSessions().filter(
    (session) => session.projectPath === projectPath
  );
}
