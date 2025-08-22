export const MOTION = {
  fast: 'var(--motion-fast)',
  base: 'var(--motion-base)',
  slow: 'var(--motion-slow)',
  easing: {
    standard: 'var(--easing-standard)',
    decel: 'var(--easing-decel)',
    accel: 'var(--easing-accel)',
  },
  pressScale: 'var(--press-scale)',
};

export function transition(
  props: string,
  duration: keyof typeof MOTION | string = 'base',
  easing: keyof typeof MOTION['easing'] | string = 'standard'
) {
  const d =
    typeof duration === 'string' && duration in MOTION
      ? (MOTION as any)[duration]
      : duration;
  const e =
    typeof easing === 'string' && easing in MOTION.easing
      ? (MOTION.easing as any)[easing]
      : easing;
  return `${props} ${d} ${e}`;
}
