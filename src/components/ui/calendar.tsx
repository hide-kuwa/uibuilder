import { DayPicker } from 'react-day-picker'
import React from 'react'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className = '', ...props }: CalendarProps) {
  return <DayPicker className={className} {...props} />
}
