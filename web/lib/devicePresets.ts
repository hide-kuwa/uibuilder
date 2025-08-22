export interface DevicePreset {
  id: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
  safeArea?: { top: number; bottom: number };
}

export const DEVICE_PRESETS: Record<DevicePreset['id'], DevicePreset> = {
  desktop: { id: 'desktop', width: 1440, height: 900 },
  tablet: { id: 'tablet', width: 1024, height: 768 },
  mobile: { id: 'mobile', width: 390, height: 844, safeArea: { top: 44, bottom: 34 } },
};
