import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={['z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-xs shadow-md', className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export default Tooltip;
