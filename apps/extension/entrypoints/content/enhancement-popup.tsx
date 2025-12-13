import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../popup/style.css';

// ============================================================================
// Types
// ============================================================================

interface Position {
  x: number;
  y: number;
}

interface EnhancementOptions {
  tone: 'professional' | 'casual' | 'formal';
  language: 'auto' | 'en' | 'ar' | 'fr';
}

interface EnhancementPopupProps {
  visible: boolean;
  position: Position;
  originalText: string;
  enhancedText: string;
  isLoading: boolean;
  error?: string;
  onReplace: () => void;
  onCancel: () => void;
  onRetry: (options: EnhancementOptions) => void;
  onUndo: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const TONE_OPTIONS = [
  { value: 'professional', label: '💼 Professional', description: 'Business-ready tone' },
  { value: 'casual', label: '😊 Casual', description: 'Friendly and relaxed' },
  { value: 'formal', label: '🎓 Formal', description: 'Academic and precise' },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'auto', label: '🌐 Auto-detect' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'ar', label: '🇸🇦 Arabic' },
  { value: 'fr', label: '🇫🇷 French' },
] as const;

// ============================================================================
// Utility Functions
// ============================================================================

function calculatePosition(selection: Selection): Position {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Position popup above selection with some padding
  const x = Math.max(10, rect.left);
  const y = Math.max(10, rect.top - 10);
  
  // Ensure popup doesn't go off-screen
  const maxX = window.innerWidth - 400; // Popup width
  const maxY = window.innerHeight - 300; // Popup height
  
  return {
    x: Math.min(x, maxX),
    y: Math.min(y, maxY)
  };
}

function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ============================================================================
// Components
// ============================================================================

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <span className="ml-3 text-gray-600">Enhancing text...</span>
    </div>
  );
}

function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-2">
        <span className="text-red-500 text-lg">⚠️</span>
        <span className="ml-2 font-medium text-red-800">Enhancement Failed</span>
      </div>
      <p className="text-red-700 text-sm mb-3">{error}</p>
      <button
        onClick={onRetry}
        className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

function ToneSelector({ 
  value, 
  onChange 
}: { 
  value: EnhancementOptions['tone']; 
  onChange: (tone: EnhancementOptions['tone']) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
      <div className="grid grid-cols-1 gap-2">
        {TONE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-2 text-left rounded-lg border transition-colors ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">{option.label}</div>
            <div className="text-xs text-gray-500">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LanguageSelector({ 
  value, 
  onChange 
}: { 
  value: EnhancementOptions['language']; 
  onChange: (language: EnhancementOptions['language']) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EnhancementOptions['language'])}
        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextComparison({ originalText, enhancedText }: { originalText: string; enhancedText: string }) {
  return (
    <div className="mb-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Original</label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          {truncateText(originalText)}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Enhanced</label>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {truncateText(enhancedText)}
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ 
  onReplace, 
  onCancel, 
  onUndo,
  showUndo = false 
}: { 
  onReplace: () => void; 
  onCancel: () => void; 
  onUndo: () => void;
  showUndo?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onReplace}
        className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        Replace Text
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>
      {showUndo && (
        <button
          onClick={onUndo}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          Undo
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function EnhancementPopup({
  visible,
  position,
  originalText,
  enhancedText,
  isLoading,
  error,
  onReplace,
  onCancel,
  onRetry,
  onUndo
}: EnhancementPopupProps) {
  const [options, setOptions] = useState<EnhancementOptions>({
    tone: 'professional',
    language: 'auto'
  });
  const [showUndo, setShowUndo] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onCancel();
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible, onCancel]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    if (visible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [visible, onCancel]);

  const handleRetry = useCallback(() => {
    onRetry(options);
  }, [options, onRetry]);

  const handleReplace = useCallback(() => {
    onReplace();
    setShowUndo(true);
    // Auto-hide after successful replacement
    setTimeout(() => {
      onCancel();
      setShowUndo(false);
    }, 3000);
  }, [onReplace, onCancel]);

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[999999] w-96 bg-white border border-gray-200 rounded-xl shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">✨ Text Enhancement</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage error={error} onRetry={handleRetry} />
        ) : enhancedText ? (
          <>
            <TextComparison originalText={originalText} enhancedText={enhancedText} />
            <ActionButtons 
              onReplace={handleReplace} 
              onCancel={onCancel} 
              onUndo={onUndo}
              showUndo={showUndo}
            />
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Text</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {truncateText(originalText)}
              </div>
            </div>
            
            <ToneSelector 
              value={options.tone} 
              onChange={(tone) => setOptions(prev => ({ ...prev, tone }))} 
            />
            
            <LanguageSelector 
              value={options.language} 
              onChange={(language) => setOptions(prev => ({ ...prev, language }))} 
            />
            
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Enhance Text
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Hook for managing popup state
// ============================================================================

export function useEnhancementPopup() {
  const [state, setState] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    originalText: '',
    enhancedText: '',
    isLoading: false,
    error: undefined as string | undefined
  });

  const show = useCallback((text: string, selection: Selection) => {
    const position = calculatePosition(selection);
    setState({
      visible: true,
      position,
      originalText: text,
      enhancedText: '',
      isLoading: false,
      error: undefined
    });
  }, []);

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: undefined }));
  }, []);

  const setResult = useCallback((enhancedText: string) => {
    setState(prev => ({ ...prev, enhancedText, isLoading: false, error: undefined }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  return {
    ...state,
    show,
    hide,
    setLoading,
    setResult,
    setError
  };
}