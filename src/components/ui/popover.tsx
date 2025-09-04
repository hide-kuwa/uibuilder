import * as PopoverPrimitive from '@radix-ui/react-popover'
import { forwardRef } from 'react'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className = '', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={className}
    {...props}
  />
))

PopoverContent.displayName = PopoverPrimitive.Content.displayName
