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
  
  const POPUP_WIDTH = 384; // w-96 = 384px
  const POPUP_HEIGHT = 400; // estimated popup height
  const MARGIN = 10; // minimum margin from viewport edges
  
  let x = rect.left;
  let y = rect.top;
  
  // Adjust horizontal position if popup would go off-screen
  if (x + POPUP_WIDTH > window.innerWidth) {
    x = window.innerWidth - POPUP_WIDTH - MARGIN;
  }
  if (x < MARGIN) {
    x = MARGIN;
  }
  
  // Smart vertical positioning
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  
  if (spaceAbove >= POPUP_HEIGHT || spaceAbove > spaceBelow) {
    // Position above selection
    y = rect.top - POPUP_HEIGHT - MARGIN;
    if (y < MARGIN) {
      y = MARGIN;
    }
  } else {
    // Position below selection
    y = rect.bottom + MARGIN;
    if (y + POPUP_HEIGHT > window.innerHeight) {
      y = window.innerHeight - POPUP_HEIGHT - MARGIN;
    }
  }
  
  return { x, y };
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
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="ml-3 text-muted-foreground">Enhancing text...</span>
    </div>
  );
}

function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-center mb-2">
        <span className="text-destructive text-lg">⚠️</span>
        <span className="ml-2 font-medium text-destructive">Enhancement Failed</span>
      </div>
      <p className="text-destructive text-sm mb-3">{error}</p>
      <button
        onClick={onRetry}
        className="px-3 py-1.5 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/90 transition-colors"
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
      <label className="block text-sm font-medium text-foreground mb-2">Tone</label>
      <div className="grid grid-cols-1 gap-2">
        {TONE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-2 text-left rounded-lg border transition-colors ${
              value === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-border hover:bg-secondary'
            }`}
          >
            <div className="font-medium text-sm">{option.label}</div>
            <div className="text-xs text-muted-foreground">{option.description}</div>
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
      <label className="block text-sm font-medium text-foreground mb-2">Language</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EnhancementOptions['language'])}
        className="w-full p-2 border border-border rounded-lg text-sm bg-background text-foreground focus:border-primary focus:outline-none"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-background text-foreground">
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
        <label className="block text-sm font-medium text-foreground mb-1">Original</label>
        <div className="p-3 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
          {truncateText(originalText)}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Enhanced</label>
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
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
        className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Replace Text
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
      >
        Cancel
      </button>
      {showUndo && (
        <button
          onClick={onUndo}
          className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-lg hover:bg-destructive/90 transition-colors"
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
      className="fixed z-[999999] w-96 bg-background border border-border rounded-xl shadow-2xl text-foreground"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: `${Math.min(400, window.innerHeight - position.y - 20)}px`,
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">✨ Text Enhancement</h3>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
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
              <label className="block text-sm font-medium text-foreground mb-1">Selected Text</label>
              <div className="p-3 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
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
              className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
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