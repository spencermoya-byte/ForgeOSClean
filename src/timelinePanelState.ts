export type TimelinePanelState = {
  open: boolean;
  unreadEvents: number;
};

let state: TimelinePanelState = {
  open: false,
  unreadEvents: 0,
};

export function updateTimelinePanel(
  update: Partial<TimelinePanelState>,
) {
  state = {
    ...state,
    ...update,
  };

  window.dispatchEvent(
    new CustomEvent('vivus-timeline-panel', {
      detail: state,
    }),
  );

  return state;
}

export function incrementTimelineUnread() {
  return updateTimelinePanel({
    unreadEvents: state.unreadEvents + 1,
  });
}
