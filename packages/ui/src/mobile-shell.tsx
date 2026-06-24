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
    <a
      href="https://wa.me/962790886714?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%B9%D9%86%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A5%D9%8A%D9%85%D9%88%D8%AA%D9%8A%D9%81%D8%A7%D9%8A"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-20 left-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 md:bottom-6"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.893c0 2.096.546 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.582 0 11.943-5.359 11.946-11.893a11.821 11.821 0 00-3.419-8.452" />
      </svg>
    </a>
  )
}

export { MobileShell }
