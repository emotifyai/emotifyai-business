import { Skeleton } from '@emotifyai/ui'

export default function InvoicesLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[160px]" />
        <Skeleton className="h-4 w-[320px]" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-[360px] w-full" />
    </div>
  )
}
