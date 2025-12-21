import { Metadata } from 'next'
import { ExtensionSuccessClient } from './extension-success-client'

export const metadata: Metadata = {
    title: 'Extension Setup Complete - EmotifAI',
    description: 'Your EmotifAI extension is ready to use',
}

export default function ExtensionSuccessPage() {
    return <ExtensionSuccessClient />
}