import { PageLoading } from '@emotifyai/ui'

export default function AuthLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <PageLoading message="جاري تحميل المصادقة…" />
        </div>
    )
}
