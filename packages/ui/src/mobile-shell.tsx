import * as React from "react"

import { cn } from "../lib/utils"

interface MobileShellProps extends React.ComponentProps<"div"> {
  header?: React.ReactNode
  footer?: React.ReactNode
  bottomNav?: React.ReactNode
}

function MobileShell({
  className,
  header,
  footer,
  bottomNav,
  children,
  ...props
}: MobileShellProps) {
  return (
    <div
      data-slot="mobile-shell"
      className={cn(
        "flex min-h-dvh flex-col overflow-x-hidden bg-background",
        bottomNav && "pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0",
        className
      )}
      {...props}
    >
      {header}
      <div className="flex flex-1 flex-col overflow-x-hidden">{children}</div>
      {footer}
      {bottomNav}
    </div>
  )
}

export { MobileShell }
