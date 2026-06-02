'use client'

import React, { useState } from 'react'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/lib/hooks/use-api-keys'
import { Button } from '@emotifyai/ui'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@emotifyai/ui'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { Badge } from '@emotifyai/ui'
import { Loader2, Plus, Trash2, Copy, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from '@emotifyai/ui'

// ============================================================================
// Types
// ============================================================================

type ApiKey = {
    id: string
    name: string
    created_at: string
    last_used_at: string | null
    revoked: boolean
}

// ============================================================================
// Utility Components
// ============================================================================

function LoadingSpinner() {
    return (
        <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}

function EmptyState() {
    return (
        <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                لا توجد مفاتيح API. أنشئ واحداً للبدء.
            </TableCell>
        </TableRow>
    )
}

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ revoked }: { revoked: boolean }) {
    if (revoked) {
        return <Badge variant="destructive">ملغى</Badge>
    }

    return (
        <Badge
            variant="secondary"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
        >
            نشط
        </Badge>
    )
}

// ============================================================================
// Copy Button Component
// ============================================================================

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('تم النسخ إلى الحافظة')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button size="icon" variant="ghost" onClick={handleCopy}>
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    )
}

// ============================================================================
// Created Key Display Component
// ============================================================================

function CreatedKeyDisplay({
    apiKey,
    onClose
}: {
    apiKey: string
    onClose: () => void
}) {
    return (
        <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium mb-2">
                    هذا مفتاح API الجديد. انسخه الآن ولن تتمكن من رؤيته مرة أخرى!
                </p>
                <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-background p-2 font-mono text-sm">
                        {apiKey}
                    </code>
                    <CopyButton text={apiKey} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onClose}>تم</Button>
            </DialogFooter>
        </div>
    )
}

// ============================================================================
// Create Key Form Component
// ============================================================================

function CreateKeyForm({
    onSubmit,
    isPending
}: {
    onSubmit: (name: string) => void
    isPending: boolean
}) {
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(name)
        setName('')
    }

    return (
        <div onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">اسم المفتاح</Label>
                    <Input
                        id="name"
                        placeholder="مثال: إضافة Chrome (عمل)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
            </div>
            <DialogFooter>
                <Button
                    type="button"
                    onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={isPending || !name.trim()}
                >
                    {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    إنشاء مفتاح
                </Button>
            </DialogFooter>
        </div>
    )
}

// ============================================================================
// Create Key Dialog Component
// ============================================================================

function CreateKeyDialog({
    open,
    onOpenChange,
    onCreate,
    createdKey,
    isPending
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (name: string) => void
    createdKey: string | null
    isPending: boolean
}) {
    const handleClose = () => onOpenChange(false)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="glow" size="sm">
                    <Plus className="me-2 h-4 w-4" />
                    إنشاء مفتاح جديد
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إنشاء مفتاح API</DialogTitle>
                    <DialogDescription>
                        أنشئ مفتاح API جديداً لاستخدامه مع إضافة إيموتيفاي للمتصفح.
                    </DialogDescription>
                </DialogHeader>

                {createdKey ? (
                    <CreatedKeyDisplay apiKey={createdKey} onClose={handleClose} />
                ) : (
                    <CreateKeyForm onSubmit={onCreate} isPending={isPending} />
                )}
            </DialogContent>
        </Dialog>
    )
}

// ============================================================================
// API Key Row Component
// ============================================================================

function ApiKeyRow({
    apiKey,
    onRevoke,
    isRevoking
}: {
    apiKey: ApiKey
    onRevoke: (id: string) => void
    isRevoking: boolean
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{apiKey.name}</TableCell>
            <TableCell>{formatDate(apiKey.created_at)}</TableCell>
            <TableCell>
                {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'أبداً'}
            </TableCell>
            <TableCell>
                <StatusBadge revoked={apiKey.revoked} />
            </TableCell>
            <TableCell className="text-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRevoke(apiKey.id)}
                    disabled={apiKey.revoked || isRevoking}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

// ============================================================================
// API Keys Table Component
// ============================================================================

function ApiKeysTable({
    apiKeys,
    onRevoke,
    isRevoking
}: {
    apiKeys: ApiKey[]
    onRevoke: (id: string) => void
    isRevoking: boolean
}) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>آخر استخدام</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-end">إجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {apiKeys.length === 0 ? (
                        <EmptyState />
                    ) : (
                        apiKeys.map((key) => (
                            <ApiKeyRow
                                key={key.id}
                                apiKey={key}
                                onRevoke={onRevoke}
                                isRevoking={isRevoking}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

// ============================================================================
// Main Component
// ============================================================================

export function ApiKeyList() {
    const { data: apiKeys, isLoading } = useApiKeys()
    const createApiKey = useCreateApiKey()
    const revokeApiKey = useRevokeApiKey()

    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleCreateKey = async (name: string) => {
        try {
            const result = await createApiKey.mutateAsync({ name })
            setCreatedKey(result.key!)
            toast.success('تم إنشاء مفتاح API بنجاح')
        } catch {
            toast.error('فشل إنشاء مفتاح API')
        }
    }

    const handleRevokeKey = async (id: string) => {
        const confirmed = confirm(
            'هل أنت متأكد من إلغاء هذا المفتاح؟ لا يمكن التراجع عن هذا الإجراء.'
        )

        if (!confirmed) return

        try {
            await revokeApiKey.mutateAsync({ id })
            toast.success('تم إلغاء مفتاح API بنجاح')
        } catch {
            toast.error('فشل إلغاء مفتاح API')
        }
    }

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) setCreatedKey(null)
    }

    if (isLoading) return <LoadingSpinner />

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">مفاتيح API الخاصة بك</h3>
                <CreateKeyDialog
                    open={isDialogOpen}
                    onOpenChange={handleDialogChange}
                    onCreate={handleCreateKey}
                    createdKey={createdKey}
                    isPending={createApiKey.isPending}
                />
            </div>

            <ApiKeysTable
                apiKeys={apiKeys || []}
                onRevoke={handleRevokeKey}
                isRevoking={revokeApiKey.isPending}
            />
        </div>
    )
}
