export interface Turf {
  id: string;
  name: string;
}

export interface TurfSettings {
  booking: {
    enabled: boolean;
    disabledReason: string | null | undefined;
    autoConfirm: boolean;
    maxHours: number;
    minHours: number;
    advanceDays: number;
    cancellationDeadline: number;
    bufferTime: number;
  };
  notifications: {
    onNewBooking: boolean;
    onCancellation: boolean;
    onPayment: boolean;
    reminderBefore: number;
  };
  payment: {
    requireAdvance: boolean;
    advanceAmount: number;
    refundEnabled: boolean;
    refundPercentage: number;
  };
  general: {
    timezone: string;
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
  };
}

export interface Session {
  id: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface OwnerSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
  };
  business: {
    businessName: string;
    gstNumber: string;
  };
  security: {
    twoFactorEnabled: boolean;
    twoFactorMethod: "sms" | "email" | "authenticator" | null;
  };
  notifications: {
    channels: {
      email: boolean;
      sms: boolean;
      push: boolean;
      whatsapp: boolean;
    };
    types: {
      newBooking: boolean;
      cancellation: boolean;
      paymentReceived: boolean;
      paymentFailed: boolean;
      refund: boolean;
      dailySummary: boolean;
      weeklyReport: boolean;
    };
    quietHours: {
      start: string;
      end: string;
    };
  };
}
