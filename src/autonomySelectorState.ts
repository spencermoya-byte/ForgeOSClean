export type AutonomyLevel =
  | 'light'
  | 'medium'
  | 'full';

let selectedAutonomy: AutonomyLevel = 'light';

export function setAutonomyLevel(
  level: AutonomyLevel,
) {
  selectedAutonomy = level;

  window.dispatchEvent(
    new CustomEvent('vivus-autonomy', {
      detail: level,
    }),
  );

  return selectedAutonomy;
}

export function getAutonomyLevel() {
  return selectedAutonomy;
}
