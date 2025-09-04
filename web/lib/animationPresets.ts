import { MOTION_PRESETS, type MotionPresetDef } from './motion-presets';

export type { MotionPresetDef };
export const animationPresets: MotionPresetDef[] = Object.values(MOTION_PRESETS);
