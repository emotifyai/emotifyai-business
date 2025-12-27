import { Metadata } from 'next'
import { ExtensionSuccessClient } from './extension-success-client'

export const metadata: Metadata = {
    title: 'Extension Setup Complete - EmotifyAI',
    description: 'Your EmotifyAI extension is ready to use',
}

export default function ExtensionSuccessPage() {
    return <ExtensionSuccessClient />
}