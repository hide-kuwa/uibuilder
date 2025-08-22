export interface ColorValue {
  light: string
  dark: string
}

export interface Tokens {
  color: {
    bg: Record<string, ColorValue>
    fg: Record<string, ColorValue>
    border: Record<string, ColorValue>
    accent: Record<string, ColorValue>
    state: Record<string, ColorValue>
    overlay: {
      scrim: ColorValue
      focus: { ring: ColorValue }
    }
  }
  space: Record<string, number>
  radius: Record<string, number>
  shadow: Record<string, string>
  font: {
    family: Record<string, string>
    size: Record<string, number>
    weight: Record<string, number>
  }
  motion: {
    duration: Record<string, number>
    easing: Record<string, string>
  }
  z: Record<string, number>
}
