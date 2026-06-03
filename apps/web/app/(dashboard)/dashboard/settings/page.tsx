'use client'

import Link from 'next/link'
import { useUser } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@emotifyai/ui'
import { Button } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { Switch } from '@emotifyai/ui'
import { Skeleton } from '@emotifyai/ui'
import { DeleteAccountDialog } from '@/components/settings/delete-account-dialog'
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form'
import { KeyRound } from 'lucide-react'

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

                <Card>
                    <CardHeader>
                        <CardTitle>الأمان</CardTitle>
                        <CardDescription>
                            إدارة كلمة المرور وإعدادات الحساب الأمنية
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">كلمة المرور</p>
                                <p className="text-sm text-muted-foreground">
                                    غيّر كلمة المرور الخاصة بحسابك
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/reset-password" className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4" />
                                    تغيير كلمة المرور
                                </Link>
                            </Button>
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
