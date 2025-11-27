'use client'

import { useState } from 'react'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/lib/hooks/use-api-keys'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Copy, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function ApiKeyList() {
    const { data: apiKeys, isLoading } = useApiKeys()
    const createApiKey = useCreateApiKey()
    const revokeApiKey = useRevokeApiKey()
    const [newKeyName, setNewKeyName] = useState('')
    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await createApiKey.mutateAsync({ name: newKeyName })
            setCreatedKey(result.key!)
            setNewKeyName('')
            toast.success('API key created successfully')
        } catch (error) {
            toast.error('Failed to create API key')
        }
    }

    const handleRevokeKey = async (id: string) => {
        if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            try {
                await revokeApiKey.mutateAsync({ id })
                toast.success('API key revoked successfully')
            } catch (error) {
                toast.error('Failed to revoke API key')
            }
        }
    }

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleCloseDialog = () => {
        setIsCreateDialogOpen(false)
        setCreatedKey(null)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your API Keys</h3>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                                Create a new API key to use with the Verba browser extension.
                            </DialogDescription>
                        </DialogHeader>

                        {!createdKey ? (
                            <form onSubmit={handleCreateKey}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Key Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Chrome Extension (Work)"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createApiKey.isPending}>
                                        {createApiKey.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Create Key
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="rounded-md bg-muted p-4">
                                    <p className="text-sm font-medium mb-2">
                                        Here is your new API key. Please copy it now as you won't be able to see it again!
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 rounded bg-background p-2 font-mono text-sm">
                                            {createdKey}
                                        </code>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(createdKey)}
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCloseDialog}>Done</Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

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
                        {apiKeys?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No API keys found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            apiKeys?.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.name}</TableCell>
                                    <TableCell>{formatDate(key.created_at)}</TableCell>
                                    <TableCell>
                                        {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        {key.revoked ? (
                                            <Badge variant="destructive">Revoked</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRevokeKey(key.id)}
                                            disabled={key.revoked || revokeApiKey.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
