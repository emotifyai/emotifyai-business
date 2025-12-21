import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'

export const metadata: Metadata = {
    title: 'Reset Password - EmotifAI',
    description: 'Reset your EmotifAI account password',
}

export default function ResetPasswordPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Reset Password
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email address and we&apos;ll send you a link to reset your password
                </p>
            </div>
            <div className="grid gap-6">
                <form>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                required
                            />
                        </div>
                        <Button type="submit" variant="glow">
                            Send Reset Link
                        </Button>
                    </div>
                </form>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Back to Login
                </Link>
            </p>
        </>
    )
}
