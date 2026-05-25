import { Metadata } from 'next'
import { ExtensionSuccessClient } from './extension-success-client'

export const metadata: Metadata = {
    title: 'اكتمل إعداد الإضافة - إيموتيفاي',
    description: 'إضافة إيموتيفاي جاهزة للاستخدام',
}

export default function ExtensionSuccessPage() {
    return <ExtensionSuccessClient />
}