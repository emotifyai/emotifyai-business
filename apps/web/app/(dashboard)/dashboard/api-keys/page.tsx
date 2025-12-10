import { ApiKeyList } from '@/components/dashboard/api-key-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card'

export default function ApiKeysPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
                <p className="text-muted-foreground">
                    Manage API keys for accessing Verba from the browser extension
                </p>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Extension Authentication</CardTitle>
                        <CardDescription>
                            Create API keys to authenticate the Verba browser extension.
                            Never share your API keys with anyone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ApiKeyList />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
