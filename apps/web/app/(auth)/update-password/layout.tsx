import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'تعيين كلمة مرور جديدة - EmotifyAI',
    description: 'أنشئ كلمة مرور جديدة آمنة لحسابك في EmotifyAI',
}

export default function UpdatePasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
