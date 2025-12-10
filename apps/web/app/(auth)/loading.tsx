import { PageLoading } from '@ui/page-loading'

export default function AuthLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <PageLoading message="Loading authentication..." />
        </div>
    )
}
