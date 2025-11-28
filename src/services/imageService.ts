// AI Prompt Generator Service for Image Generation
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sakha's signature visual identity style prompt
const SAKHA_STYLE_PROMPT = `Generate educational images in this exact style:

VISUAL IDENTITY:
- Dark cosmic background (#0A0A0A to #1F1F1F) with subtle starfield
- Glass-morphism cards with frosted glass effect (rgba(20, 20, 20, 0.6))
- White/light gray text (#FFFFFF, #A0A0A0)
- Accent color: White (#FFFFFF) for highlights
- Soft glowing borders (rgba(255, 255, 255, 0.1))

LAYOUT STRUCTURE:
- Main subject/illustration in the center (futuristic, sleek style)
- 3-4 glass-morphic information cards around the edges
- Each card has a clear header and clean bullet points
- Modern, minimalist typography (Inter font style)
- Small icons next to key information (glowing, simple line icons)

ART STYLE:
- Sleek, modern, slightly futuristic illustration
- Smooth gradients and soft shadows
- Cosmic/space-inspired when relevant
- Glass and transparency effects
- Professional digital art (not hand-drawn)
- Think: "Apple keynote meets NASA mission graphics"

COLOR PALETTE:
- Background: Deep black (#050505) with subtle star dots
- Cards: Dark glass (rgba(20, 20, 20, 0.6)) with white borders
- Text: White primary (#FFFFFF), gray secondary (#A0A0A0)
- Accents: White glow effects, subtle blue/purple hints
- Keep it clean, sophisticated, and dark-mode native

INFORMATION STRUCTURE (Adapt to subject but always include 3-4 educational sections):
- Definition/Overview card
- Key characteristics/features card
- Practical applications/examples card
- Important facts/tips card

MOOD:
- Intelligent, sophisticated, modern
- Learning-focused but beautiful
- Professional yet approachable
- Cosmic/space aesthetic where it fits naturally

BRAND CONSISTENCY:
Match the Sakha app interface:
- Glass panels with backdrop blur
- Starfield backgrounds
- Clean white text on dark
- Minimalist modern design
- Educational but visually stunning

Make every image feel like it belongs in a premium learning app - beautiful, informative, and perfectly aligned with Sakha's dark cosmic aesthetic.

USER REQUEST: `;

class ImagePromptService {
    /**
     * Generate complete prompt with Sakha style included
     * This is what users will copy and paste into image generators
     */
    async generateFullPromptFromConversation(
        conversationMessages: Array<{ role: string; content: string }>,
        apiKey: string
    ): Promise<string> {
        if (!apiKey) {
            throw new Error('Google API key is required');
        }

        if (conversationMessages.length === 0) {
            throw new Error('No conversation to analyze');
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            // Create a prompt for the AI to analyze the conversation and generate an image prompt
            const systemPrompt = `You are an expert at creating detailed image generation prompts for educational content.

Analyze the conversation below and create a single, detailed image prompt that would best visualize the main concept being discussed.

Requirements:
- Focus on the most recent or most important topic
- Be specific and descriptive
- Include key visual elements that would aid learning
- Keep it concise (2-3 sentences max)
- Don't include style instructions (those will be added automatically)

Example output: "The water cycle showing evaporation from oceans, condensation forming clouds, precipitation as rain, and collection in rivers flowing back to the ocean, with clear labels for each stage"

Conversation to analyze:
${conversationMessages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n\n')}

Generate only the image prompt, nothing else:`;

            const result = await model.generateContent(systemPrompt);
            const response = result.response;
            const topicPrompt = response.text().trim();

            // Combine Sakha style with topic prompt
            return SAKHA_STYLE_PROMPT + topicPrompt;
        } catch (error: any) {
            console.error('Prompt generation error:', error);
            throw new Error('Failed to generate prompt from conversation');
        }
    }
}

export const imageService = new ImagePromptService();
