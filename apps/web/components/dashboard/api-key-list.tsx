'use client'

import React, { useState } from 'react'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/lib/hooks/use-api-keys'
import { Button } from '@ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@ui/dialog'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Badge } from '@ui/badge'
import { Loader2, Plus, Trash2, Copy, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

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
                No API keys found. Create one to get started.
            </TableCell>
        </TableRow>
    )
}

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ revoked }: { revoked: boolean }) {
    if (revoked) {
        return <Badge variant="destructive">Revoked</Badge>
    }

    return (
        <Badge
            variant="secondary"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
        >
            Active
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
        toast.success('Copied to clipboard')
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
                    Here is your new API key. Please copy it now as you won't be able to see it again!
                </p>
                <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-background p-2 font-mono text-sm">
                        {apiKey}
                    </code>
                    <CopyButton text={apiKey} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onClose}>Done</Button>
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
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Chrome Extension (Work)"
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
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Key
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
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Key
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                        Create a new API key to use with the EmotifyAI browser extension.
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
                {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}
            </TableCell>
            <TableCell>
                <StatusBadge revoked={apiKey.revoked} />
            </TableCell>
            <TableCell className="text-right">
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
                        <TableHead>Name</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
            toast.success('API key created successfully')
        } catch {
            toast.error('Failed to create API key')
        }
    }

    const handleRevokeKey = async (id: string) => {
        const confirmed = confirm(
            'Are you sure you want to revoke this API key? This action cannot be undone.'
        )

        if (!confirmed) return

        try {
            await revokeApiKey.mutateAsync({ id })
            toast.success('API key revoked successfully')
        } catch {
            toast.error('Failed to revoke API key')
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
                <h3 className="text-lg font-medium">Your API Keys</h3>
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
