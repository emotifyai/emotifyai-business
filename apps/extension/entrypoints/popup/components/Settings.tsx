import { useState, useEffect } from 'react';
import { getSettings, setSettings as saveSettings } from '@/utils/storage';
import { initSettingsSync, forceSync } from '@/services/sync';
import type { Settings } from '@/types';

interface SettingsProps {
    onBack: () => void;
}

export default function SettingsComponent({ onBack }: SettingsProps) {
    const [settings, setSettingsState] = useState<Settings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const currentSettings = await getSettings();
        setSettingsState(currentSettings);
    };

    const handleChange = async (key: keyof Settings, value: any) => {
        if (!settings) return;

        const newSettings = { ...settings, [key]: value };
        setSettingsState(newSettings);

        setIsSaving(true);
        try {
            await saveSettings({ [key]: value });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSyncToggle = async (checked: boolean) => {
        // In a real app, we might save this preference
        console.log('Sync toggled:', checked);
        if (checked) {
            setIsSyncing(true);
            try {
                await initSettingsSync();
                await forceSync();
            } finally {
                setIsSyncing(false);
            }
        }
    };

    if (!settings) {
        return <div className="flex items-center justify-center min-h-[300px] text-gray-400">Loading...</div>;
    }

    return (
        <div className="p-5">
            <div className="flex items-center gap-3 mb-6">
                <button className="px-3 py-1.5 border-none bg-gray-100 rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-200" onClick={onBack}>
                    ← Back
                </button>
                <h2 className="text-xl font-semibold m-0 text-gray-800">Settings</h2>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">General</h3>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Sync Settings</label>
                        <span className="text-xs text-gray-500">Sync settings across devices</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer relative">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            defaultChecked={true}
                            onChange={(e) => handleSyncToggle(e.target.checked)}
                        />
                        <span className="w-11 h-6 bg-gray-300 rounded-full relative transition-colors peer-checked:bg-[#667eea] after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:top-[3px] after:left-[3px] after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                </div>
                {isSyncing && <div className="text-xs text-[#667eea] mb-4 font-medium">Syncing...</div>}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Keyboard Shortcut</label>
                        <span className="text-xs text-gray-500">Enable shortcut ({settings.keyboardShortcut})</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer relative">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={settings.keyboardShortcutEnabled}
                            onChange={(e) => handleChange('keyboardShortcutEnabled', e.target.checked)}
                        />
                        <span className="w-11 h-6 bg-gray-300 rounded-full relative transition-colors peer-checked:bg-[#667eea] after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:top-[3px] after:left-[3px] after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Theme</h3>
                <div className="flex gap-2">
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <label key={theme} className="group flex-1 flex items-center justify-center p-2.5 border-2 border-gray-200 rounded-lg cursor-pointer transition-all has-[:checked]:border-[#667eea] has-[:checked]:bg-blue-50">
                            <input
                                type="radio"
                                name="theme"
                                value={theme}
                                className="sr-only"
                                checked={settings.theme === theme}
                                onChange={() => handleChange('theme', theme)}
                            />
                            <span className="text-sm text-gray-500 transition-colors group-has-[:checked]:text-[#667eea] group-has-[:checked]:font-semibold">
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Language Preference</h3>
                <select
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-600 bg-white cursor-pointer transition-colors focus:outline-none focus:border-[#667eea]"
                    value={settings.preferredLanguage}
                    onChange={(e) =>
                        handleChange('preferredLanguage', e.target.value as any)
                    }
                >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                </select>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Auto-detect Language</label>
                        <span className="text-xs text-gray-500">Automatically detect text language</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer relative">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={settings.autoDetectLanguage}
                            onChange={(e) =>
                                handleChange('autoDetectLanguage', e.target.checked)
                            }
                        />
                        <span className="w-11 h-6 bg-gray-300 rounded-full relative transition-colors peer-checked:bg-[#667eea] after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:top-[3px] after:left-[3px] after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                </div>
            </div>

            {isSaving && (
                <div className="fixed bottom-5 right-5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg animate-slideUp">Saving...</div>
            )}
        </div>
    );
}
