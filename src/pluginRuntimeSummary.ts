import { resolvePluginRuntimeStates } from './pluginRuntimeState';

export function getPluginRuntimeSummary(pluginId: string) {
  const state = resolvePluginRuntimeStates().find((item) => item.pluginId === pluginId);

  if (!state) {
    return {
      status: 'blocked',
      note: 'Runtime state unavailable.',
    };
  }

  if (state.blockedReasons.length) {
    return {
      status: state.status,
      note: `Blocked: ${state.blockedReasons.join(', ')}`,
    };
  }

  if (state.approvalReasons.length) {
    return {
      status: state.status,
      note: `Approval required: ${state.approvalReasons.join(', ')}`,
    };
  }

  return {
    status: state.status,
    note: state.panelReady ? 'Runtime ready and panel available.' : 'Runtime ready.',
  };
}
