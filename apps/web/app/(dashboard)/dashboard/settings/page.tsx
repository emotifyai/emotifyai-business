'use client'

import { useUser } from '@/lib/hooks/use-auth'
import { Button } from '@emotifyai/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { Switch } from '@emotifyai/ui'
import { Skeleton } from '@emotifyai/ui'
import { toast } from 'sonner'
import React from "react"
import { UserAvatar } from '@/components/user-avatar'

export default function SettingsPage() {
    const { data: user, isLoading } = useUser()

    if (isLoading) {
        return <SettingsSkeleton />
    }

    if (!user) return null

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success('تم تحديث الملف الشخصي بنجاح')
    }

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
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <UserAvatar
                                    avatarUrl={user.avatar_url}
                                    seed={user.id || user.email}
                                    alt={user.display_name || 'مستخدم'}
                                    size="lg"
                                />
                                <p className="text-sm text-muted-foreground">
                                    صورة ملفك من مزود تسجيل الدخول أو رمز تعبيري تلقائي
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">اسم العرض</Label>
                                <Input id="name" defaultValue={user.display_name || ''} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input id="email" defaultValue={user.email} disabled />
                            </div>
                            <Button type="submit" variant="glow">حفظ التغييرات</Button>
                        </form>
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
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>رسائل تسويقية</Label>
                                <p className="text-sm text-muted-foreground">
                                    استلام رسائل عن الميزات والعروض الجديدة
                                </p>
                            </div>
                            <Switch />
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
                        <Button variant="destructive">حذف الحساب</Button>
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
