export const trackEvent = (eventName: string, data?: any) => {
  console.log(`[Telemetry] ${eventName}`, data || '');
};