export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarData {
  message: string;
  type: NotificationType;
}
