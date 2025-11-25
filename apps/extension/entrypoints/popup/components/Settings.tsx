import { useState, useEffect } from 'react';
import { getSettings, setSettings as saveSettings } from '@/utils/storage';
import type { Settings } from '@/types';
import './Settings.css';

interface SettingsProps {
    onBack: () => void;
}

export default function SettingsComponent({ onBack }: SettingsProps) {
    const [settings, setSettingsState] = useState<Settings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    if (!settings) {
        return <div className="settings__loading">Loading...</div>;
    }

    return (
        <div className="settings">
            <div className="settings__header">
                <button className="settings__back" onClick={onBack}>
                    ← Back
                </button>
                <h2 className="settings__title">Settings</h2>
            </div>

            <div className="settings__section">
                <h3 className="settings__section-title">Keyboard Shortcut</h3>
                <label className="settings__toggle">
                    <input
                        type="checkbox"
                        checked={settings.keyboardShortcutEnabled}
                        onChange={(e) =>
                            handleChange('keyboardShortcutEnabled', e.target.checked)
                        }
                    />
                    <span className="settings__toggle-slider" />
                    <span className="settings__toggle-label">
                        Enable keyboard shortcut ({settings.keyboardShortcut})
                    </span>
                </label>
            </div>

            <div className="settings__section">
                <h3 className="settings__section-title">Theme</h3>
                <div className="settings__radio-group">
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <label key={theme} className="settings__radio">
                            <input
                                type="radio"
                                name="theme"
                                value={theme}
                                checked={settings.theme === theme}
                                onChange={() => handleChange('theme', theme)}
                            />
                            <span className="settings__radio-label">
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="settings__section">
                <h3 className="settings__section-title">Language Preference</h3>
                <select
                    className="settings__select"
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

            <div className="settings__section">
                <label className="settings__toggle">
                    <input
                        type="checkbox"
                        checked={settings.autoDetectLanguage}
                        onChange={(e) =>
                            handleChange('autoDetectLanguage', e.target.checked)
                        }
                    />
                    <span className="settings__toggle-slider" />
                    <span className="settings__toggle-label">
                        Auto-detect language from text
                    </span>
                </label>
            </div>

            {isSaving && (
                <div className="settings__save-indicator">Saving...</div>
            )}
        </div>
    );
}
