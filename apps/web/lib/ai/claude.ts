import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
const MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024', 10)

export interface EnhanceOptions {
    text: string
    mode: 'enhance' | 'rephrase' | 'simplify' | 'expand'
    language?: string
    tone?: 'formal' | 'casual' | 'professional'
}

export interface EnhanceResult {
    enhancedText: string
    tokensUsed: number
    language: string
}

/**
 * Enhance text using Claude AI
 * Implements retry logic with exponential backoff
 */
export async function enhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
    const { text, mode, language = 'en', tone = 'professional' } = options

    // Build the prompt
    const systemPrompt = buildSystemPrompt(mode, language, tone)
    const userPrompt = text

    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
        try {
            const message = await anthropic.messages.create({
                model: MODEL,
                max_tokens: MAX_TOKENS,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userPrompt,
                    },
                ],
            })

            // Extract the text from the response
            const enhancedText = message.content
                .filter((block) => block.type === 'text')
                .map((block) => (block as Anthropic.TextBlock).text)
                .join('\n')

            // Calculate tokens used (approximation)
            const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

            return {
                enhancedText,
                tokensUsed,
                language,
            }
        } catch (error) {
            if (error instanceof Anthropic.APIError) {
                // Handle rate limiting with exponential backoff
                if (error.status === 429) {
                    retries++
                    if (retries >= maxRetries) {
                        throw new Error('RATE_LIMIT_EXCEEDED')
                    }

                    const delay = Math.pow(2, retries) * 1000 // Exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, delay))
                    continue
                }

                // Handle other API errors
                console.error('Anthropic API error:', error)
                throw new Error('AI_SERVICE_ERROR')
            }

            // Handle unexpected errors
            console.error('Unexpected error:', error)
            throw new Error('INTERNAL_ERROR')
        }
    }

    throw new Error('MAX_RETRIES_EXCEEDED')
}

/**
 * Build the system prompt based on mode, language, and tone
 */
function buildSystemPrompt(
    mode: EnhanceOptions['mode'],
    language: string,
    tone: EnhanceOptions['tone']
): string {
    const languageNames: Record<string, string> = {
        en: 'English',
        ar: 'Arabic',
        fr: 'French',
    }

    const languageName = languageNames[language] || 'English'

    const basePrompt = `You are an expert writing assistant specializing in ${languageName} text enhancement. Your task is to improve the user's text while maintaining their original meaning and intent.`

    const modeInstructions: Record<EnhanceOptions['mode'], string> = {
        enhance: `Improve the text by:
- Correcting grammar and spelling errors
- Enhancing clarity and readability
- Improving word choice and vocabulary
- Maintaining the original tone and style
- Keeping the same length (approximately)`,

        rephrase: `Rephrase the text by:
- Using different words and sentence structures
- Maintaining the exact same meaning
- Keeping the same tone and formality level
- Ensuring natural flow and readability`,

        simplify: `Simplify the text by:
- Using simpler words and shorter sentences
- Breaking down complex ideas
- Removing jargon and technical terms
- Making it accessible to a general audience
- Maintaining the core message`,

        expand: `Expand the text by:
- Adding relevant details and examples
- Elaborating on key points
- Improving depth and comprehensiveness
- Maintaining coherence and flow
- Doubling or tripling the length while staying relevant`,
    }

    const toneInstructions: Record<NonNullable<EnhanceOptions['tone']>, string> = {
        formal: 'Use formal language, proper grammar, and professional vocabulary.',
        casual: 'Use conversational language that feels natural and friendly.',
        professional: 'Use clear, professional language suitable for business contexts.',
    }

    const toneInstruction = tone ? `\nTone: ${toneInstructions[tone]}` : ''

    return `${basePrompt}

${modeInstructions[mode]}${toneInstruction}

IMPORTANT:
- Output ONLY the enhanced text, no explanations or meta-commentary
- Preserve the original language (${languageName})
- If the input quality is poor or the language is not ${languageName}, still do your best
- Do not add greetings, signatures, or formatting unless present in the original`
}

/**
 * Mock enhancement for development/testing
 * Set MOCK_AI_RESPONSES=true in .env.local to use this
 */
export async function mockEnhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { text, mode } = options

    const mockEnhancements: Record<EnhanceOptions['mode'], string> = {
        enhance: `[ENHANCED] ${text}`,
        rephrase: `[REPHRASED] ${text}`,
        simplify: `[SIMPLIFIED] ${text}`,
        expand: `[EXPANDED] ${text} - This is additional content to demonstrate expansion.`,
    }

    return {
        enhancedText: mockEnhancements[mode],
        tokensUsed: 100,
        language: options.language || 'en',
    }
}
