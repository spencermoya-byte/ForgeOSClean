export type SecretEntry = {
  key: string;
  value: string;
  updatedAt: string;
};

const STORAGE_KEY = 'vivus.secrets.v1';

function readSecrets(): Record<string, SecretEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSecrets(secrets: Record<string, SecretEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(secrets));
}

export function setSecret(key: string, value: string) {
  const secrets = readSecrets();
  secrets[key] = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  };
  writeSecrets(secrets);
}

export function getSecret(key: string) {
  return readSecrets()[key]?.value ?? null;
}
