export type VivusNotification = {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
  read: boolean;
};

let notifications: VivusNotification[] = [];

export function pushNotification(
  title: string,
  message: string,
  severity: VivusNotification['severity'] = 'info',
) {
  const notification: VivusNotification = {
    id: `notification-${Date.now()}`,
    title,
    message,
    severity,
    createdAt: Date.now(),
    read: false,
  };

  notifications.unshift(notification);

  window.dispatchEvent(
    new CustomEvent('vivus-notifications', {
      detail: notifications,
    }),
  );

  return notification;
}

export function getNotifications() {
  return notifications;
}
