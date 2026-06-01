'use client'

import { useUser } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { Switch } from '@emotifyai/ui'
import { Skeleton } from '@emotifyai/ui'
import { DeleteAccountDialog } from '@/components/settings/delete-account-dialog'
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form'

export default function SettingsPage() {
    const { data: user, isLoading } = useUser()

    if (isLoading) {
        return <SettingsSkeleton />
    }

    if (!user) return null

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">الإعدادات</h2>
                <p className="text-muted-foreground">
                    إدارة إعدادات حسابك وتفضيلاتك
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>الملف الشخصي</CardTitle>
                        <CardDescription>
                            تحديث معلوماتك الشخصية
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileSettingsForm
                            userId={user.id}
                            email={user.email}
                            displayName={user.display_name || ''}
                            avatarUrl={user.avatar_url}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>التفضيلات</CardTitle>
                        <CardDescription>
                            تخصيص تجربة إيموتيفاي
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>إشعارات البريد</Label>
                                <p className="text-sm text-muted-foreground">
                                    استلام رسائل عن حدود الاستخدام والتحديثات
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">منطقة الخطر</CardTitle>
                        <CardDescription>
                            إجراءات لا رجعة فيها على حسابك
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            سيُطلب منك كتابة اسم العرض الحالي للتأكيد — لا يمكن التراجع عن
                            الحذف.
                        </p>
                        <DeleteAccountDialog
                            displayName={user.display_name || ''}
                            email={user.email}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function SettingsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className="grid gap-6">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[200px]" />
            </div>
        </div>
    )
}
