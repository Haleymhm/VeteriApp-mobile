export type PushTokenPayload = {
  token: string;
  platform: 'expo' | 'ios' | 'android';
};

export type PushRegistrationResponse = {
  success: boolean;
};

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  receivedAt: string;
};
