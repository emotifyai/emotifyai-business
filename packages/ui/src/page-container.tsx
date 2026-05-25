import * as React from "react"

import { cn } from "../lib/utils"

function PageContainer({
  className,
  as: Comp = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: "div" | "main" | "section" }) {
  return (
    <Comp
      data-slot="page-container"
      className={cn("page-container w-full max-w-full overflow-x-hidden", className)}
      {...props}
    />
  )
}

export { PageContainer }
