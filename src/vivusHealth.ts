export type VivusHealthCheck = {
  name: string;
  healthy: boolean;
  detail: string;
};

export function getVivusHealthChecks(): VivusHealthCheck[] {
  return [];
}
