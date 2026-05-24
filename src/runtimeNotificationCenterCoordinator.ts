import { getNotifications } from './notificationCenterState';

export function initializeNotificationRuntime() {
  return getNotifications();
}
