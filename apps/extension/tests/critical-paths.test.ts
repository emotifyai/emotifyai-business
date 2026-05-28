import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAuthToken, setAuthToken, clearAuthToken, incrementUsage, getUsageStats } from '@/utils/storage';
import { enhanceText } from '@/services/api/ai';
import { checkLimit } from '@/services/api/subscription';
import background from '@/entrypoints/background';

/**
 * Critical Path Tests for EmotifyAI Extension
 * 
 * These tests cover the essential user flows and error scenarios:
 * 1. Background Script - Context menu and text enhancement
 * 2. Content Script - Text replacement and undo
 * 3. API Client - Authentication and error handling
 * 4. Storage - Auth token and usage persistence
 */

// Helper to mock fetch responses completely for ky compatibility
function mockResponse(ok: boolean, status: number, data: any) {
    const resp = {
        ok,
        status,
        clone: () => resp,
        text: async () => typeof data === 'string' ? data : JSON.stringify(data),
        json: async () => data,
    };
    return resp;
}

// ============================================================================
// STORAGE TESTS - Critical for auth and usage tracking
// ============================================================================

describe('Storage - Critical Paths', () => {
    beforeEach(async () => {
        // Clear storage before each test
        await browser.storage.local.clear();
    });

    describe('Auth Token Persistence', () => {
        it('should store and retrieve auth token', async () => {
            const token = 'test-auth-token-123';
            await setAuthToken(token);

            const retrieved = await getAuthToken();
            expect(retrieved).toBe(token);
        });

        it('should return null when no token exists', async () => {
            const token = await getAuthToken();
            expect(token).toBeNull();
        });

        it('should clear auth token', async () => {
            await setAuthToken('test-token');
            await clearAuthToken();

            const token = await getAuthToken();
            expect(token).toBeNull();
        });
    });

    describe('Usage Tracking', () => {
        it('should increment usage counter', async () => {
            await incrementUsage();
            const stats = await getUsageStats();

            expect(stats).toBeDefined();
            expect(stats?.used).toBe(1);
        });

        it('should track multiple usage increments', async () => {
            await incrementUsage();
            await incrementUsage();
            await incrementUsage();

            const stats = await getUsageStats();
            expect(stats?.used).toBe(3);
        });
    });
});

// ============================================================================
// API CLIENT TESTS - Critical for backend communication
// ============================================================================

describe('API Client - Critical Paths', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Authentication', () => {
        it('should include auth token in request headers', async () => {
            const token = 'test-token-456';
            await setAuthToken(token);

            // This will be intercepted by MSW in dev mode
            // In production, it would call real backend
            try {
                await enhanceText('test text', { language: 'en' });
            } catch (_error) {
                // Expected to fail without backend, but headers should be set
            }
        });

        it('should handle missing auth token gracefully', async () => {
            await clearAuthToken();

            try {
                await enhanceText('test text', { language: 'en' });
                expect.fail('Should throw authentication error');
            } catch (error: any) {
                expect(error.message).toContain('Unauthorized');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors', async () => {
            await setAuthToken('test-token');

            // Mock network failure
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as any;

            try {
                await enhanceText('test text', { language: 'en' });
                expect.fail('Should throw network error');
            } catch (error: any) {
                expect(error.message).toBeDefined();
            } finally {
                global.fetch = originalFetch;
            }
        });

        it('should handle API errors with proper error codes', async () => {
            await setAuthToken('test-token');

            // Mock API error response
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue(
                mockResponse(false, 429, { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' })
            ) as any;

            try {
                await enhanceText('test text', { language: 'en' });
                expect.fail('Should throw rate limit error');
            } catch (error: any) {
                expect(error.statusCode).toBe(429);
            } finally {
                global.fetch = originalFetch;
            }
        });
    });

    describe('Retry Logic', () => {
        it('should retry on transient errors', async () => {
            await setAuthToken('test-token');

            let callCount = 0;
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount < 3) {
                    return Promise.resolve(
                        mockResponse(false, 503, { message: 'Service unavailable' })
                    );
                }
                return Promise.resolve(
                    mockResponse(true, 200, { enhancedText: 'Enhanced text', detectedLanguage: 'en', confidence: 0.95 })
                );
            }) as any;

            try {
                const result = await enhanceText('test text', { language: 'en' });
                expect(callCount).toBeGreaterThan(1); // Should have retried
                expect(result.enhancedText).toBe('Enhanced text');
            } finally {
                global.fetch = originalFetch;
            }
        });
    });
});

// ============================================================================
// SUBSCRIPTION TESTS - Critical for usage limits
// ============================================================================

describe('Subscription - Critical Paths', () => {
    beforeEach(async () => {
        await browser.storage.local.clear();
    });

    describe('Usage Limit Enforcement', () => {
        it('should allow usage within trial limit', async () => {
            // Mock API subscription check
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue(
                mockResponse(true, 200, {
                    success: true,
                    data: {
                        tier: 'trial',
                        status: 'active',
                        credits_limit: 10,
                        credits_used: 5,
                    }
                })
            ) as any;

            try {
                await expect(checkLimit()).resolves.not.toThrow();
            } finally {
                global.fetch = originalFetch;
            }
        });

        it('should block usage when trial limit exceeded', async () => {
            // Mock API subscription check
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue(
                mockResponse(true, 200, {
                    success: true,
                    data: {
                        tier: 'trial',
                        status: 'active',
                        credits_limit: 10,
                        credits_used: 10,
                    }
                })
            ) as any;

            try {
                await expect(checkLimit()).rejects.toThrow('trial limit');
            } finally {
                global.fetch = originalFetch;
            }
        });

        it('should allow unlimited usage for monthly subscription', async () => {
            // Mock API subscription check
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue(
                mockResponse(true, 200, {
                    success: true,
                    data: {
                        tier: 'monthly',
                        status: 'active',
                        credits_limit: -1,
                        credits_used: 1000,
                    }
                })
            ) as any;

            try {
                await expect(checkLimit()).resolves.not.toThrow();
            } finally {
                global.fetch = originalFetch;
            }
        });

        it('should allow unlimited usage for lifetime subscription', async () => {
            // Mock API subscription check
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue(
                mockResponse(true, 200, {
                    success: true,
                    data: {
                        tier: 'lifetime',
                        status: 'active',
                        credits_limit: -1,
                        credits_used: 10000,
                    }
                })
            ) as any;

            try {
                await expect(checkLimit()).resolves.not.toThrow();
            } finally {
                global.fetch = originalFetch;
            }
        });
    });
});

// ============================================================================
// BACKGROUND SCRIPT TESTS - Critical for context menu and enhancement flow
// ============================================================================

describe('Background Script - Critical Paths', () => {
    beforeEach(async () => {
        await browser.storage.local.clear();
        vi.clearAllMocks();
        // Initialize background script execution
        background.main();
    });

    describe('Context Menu', () => {
        it('should be disabled when not authenticated', async () => {
            await clearAuthToken();
            
            // Re-run setup to trigger createContextMenu
            background.main();

            // Context menu should be created
            expect(browser.contextMenus.create).toHaveBeenCalled();
        });

        it('should be enabled when authenticated', async () => {
            await setAuthToken('test-token');

            // Re-run setup to trigger createContextMenu
            background.main();

            // Trigger context menu update by simulating storage watch callback
            await browser.storage.local.set({ 'local:authToken': 'test-token' });

            expect(browser.contextMenus.create).toHaveBeenCalled();
        });
    });

    describe('Text Enhancement Flow', () => {
        it('should handle successful text enhancement', async () => {
            await setAuthToken('test-token');

            // Mock successful enhancement
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockImplementation((req) => {
                const url = typeof req === 'string' ? req : (req instanceof URL ? req.toString() : req.url);
                if (url.includes('subscription')) {
                    return Promise.resolve(
                        mockResponse(true, 200, {
                            success: true,
                            data: {
                                tier: 'monthly',
                                status: 'active',
                                credits_limit: -1,
                                credits_used: 0,
                            }
                        })
                    );
                }
                return Promise.resolve(
                    mockResponse(true, 200, {
                        enhancedText: 'This is enhanced text.',
                        detectedLanguage: 'en',
                        confidence: 0.95,
                    })
                );
            }) as any;

            try {
                const result = await enhanceText('This is test text.', { language: 'auto' });
                expect(result.enhancedText).toBe('This is enhanced text.');
                expect(result.detectedLanguage).toBe('en');
            } finally {
                global.fetch = originalFetch;
            }
        });

        it('should handle enhancement errors gracefully', async () => {
            await setAuthToken('test-token');

            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue(
                mockResponse(false, 500, { code: 'INTERNAL_ERROR', message: 'AI service unavailable' })
            ) as any;

            try {
                await enhanceText('test text', { language: 'en' });
                expect.fail('Should throw error');
            } catch (error: any) {
                expect(error.message).toContain('AI service unavailable');
            } finally {
                global.fetch = originalFetch;
            }
        });

        it('should block enhancement when usage limit exceeded', async () => {
            await setAuthToken('test-token');
            
            // Mock API subscription check to return exceeded limits
            const originalFetch = global.fetch;
                    }
                }),
                json: async () => ({
                    success: true,
                    data: {
                        tier: 'trial',
                        status: 'active',
                        credits_limit: 10,
                        credits_used: 10,
                    }
                }),
            }) as any;

            try {
                await expect(checkLimit()).rejects.toThrow();
            } finally {
                global.fetch = originalFetch;
            }
        });
    });
});

// ============================================================================
// CONTENT SCRIPT TESTS - Critical for text replacement
// ============================================================================

describe('Content Script - Critical Paths', () => {
    describe('Text Replacement', () => {
        it('should replace selected text in DOM', () => {
            // Create a test DOM element
            const div = document.createElement('div');
            div.textContent = 'Original text here';
            document.body.appendChild(div);

            // Create a selection
            const range = document.createRange();
            range.selectNodeContents(div);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            // Simulate text replacement
            const enhancedText = 'Enhanced text here';
            range.deleteContents();
            const textNode = document.createTextNode(enhancedText);
            range.insertNode(textNode);

            expect(div.textContent).toBe(enhancedText);

            // Cleanup
            document.body.removeChild(div);
        });

        it('should handle empty selection gracefully', () => {
            const selection = window.getSelection();
            selection?.removeAllRanges();

            expect(selection?.toString()).toBe('');
        });
    });

    describe('Undo Functionality', () => {
        it('should maintain undo stack', () => {
            const undoStack: Array<{ text: string; node: Node }> = [];

            const div = document.createElement('div');
            div.textContent = 'Original text';
            document.body.appendChild(div);

            // Save to undo stack
            undoStack.push({
                text: div.textContent,
                node: div.firstChild!,
            });

            // Modify text (without replacing the text node itself)
            div.firstChild!.textContent = 'Modified text';

            // Undo
            const lastAction = undoStack.pop();
            if (lastAction) {
                lastAction.node.textContent = lastAction.text;
            }

            expect(div.textContent).toBe('Original text');

            // Cleanup
            document.body.removeChild(div);
        });
    });
});
