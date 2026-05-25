"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "../lib/utils"

export interface BottomNavItem {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

interface BottomNavProps extends React.ComponentProps<"nav"> {
  items: BottomNavItem[]
  linkComponent?: React.ElementType
}

function BottomNav({
  className,
  items,
  linkComponent: LinkComponent = "a",
  ...props
}: BottomNavProps) {
  return (
    <nav
      data-slot="bottom-nav"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-bottom safe-area-x",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const Comp = LinkComponent
          return (
            <Comp
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium transition-colors",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center [&_svg]:size-5">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Comp>
          )
        })}
      </div>
    </nav>
  )
}

function BottomNavLink({
  className,
  asChild = false,
  active,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean; active?: boolean }) {
  const Comp = asChild ? Slot : "a"
  return (
    <Comp
      className={cn(
        "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { BottomNav, BottomNavLink }
