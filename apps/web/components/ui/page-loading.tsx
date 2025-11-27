import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface PageLoadingProps {
    message?: string
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    )
}
