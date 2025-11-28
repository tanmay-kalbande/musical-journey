// AI Prompt Generator Service for Image Generation
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sakha's watercolor educational image style
const SAKHA_STYLE_PROMPT = `Create a beautiful watercolor painting illustration in a premium educational style. The image should feature soft, flowing watercolor textures with gentle color gradients and artistic brush strokes that blend naturally. Place the "SAKHA" logo text in elegant serif typography at the top right corner in deep navy blue or charcoal gray. Use a warm, inviting color palette with soft pastels (muted blues, gentle purples, warm oranges, soft greens) that create an approachable yet sophisticated learning atmosphere. The composition should be clean and uncluttered with 60% dedicated to the main educational illustration in the center, rendered in detailed watercolor style with visible brush strokes and natural color bleeding effects. Include 3-4 subtle information cards or label boxes around the illustration with hand-lettered text style, each containing 2-3 key facts or concepts with simple icons. The overall mood should be artistic, inspiring, and intellectually stimulating - imagine a blend of National Geographic illustrations and modern educational infographics, but rendered entirely in watercolor painting technique. Keep backgrounds soft and atmospheric with subtle texture, allowing the main subject to stand out. Add small decorative watercolor elements (dots, small flourishes, or abstract shapes) to enhance visual interest without cluttering. Technical parameters: medium saturation (60-70%), soft lighting with natural shadows, paper texture overlay at 20% opacity, artistic composition following rule of thirds, hand-painted aesthetic throughout. Style reference: contemporary watercolor educational illustration meets premium learning design. Subject for this illustration: `;

class ImagePromptService {
    /**
     * Generate complete prompt with Sakha watercolor style
     * Uses the same AI model the user is currently chatting with
     */
    async generateFullPromptFromConversation(
        conversationMessages: Array<{ role: string; content: string }>,
        apiKey: string,
        modelName: string = 'gemini-2.5-flash' // Fallback to 2.5 flash
    ): Promise<string> {
        if (!apiKey) {
            throw new Error('Google API key is required');
        }

        if (conversationMessages.length === 0) {
            throw new Error('No conversation to analyze');
        }

        try {
            // Only use Google/Gemini models - fallback if not a Gemini model
            const isGeminiModel = modelName.toLowerCase().includes('gemini');
            const actualModel = isGeminiModel ? modelName : 'gemini-2.5-flash';

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: actualModel });

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

            // Combine Sakha watercolor style with topic prompt
            return SAKHA_STYLE_PROMPT + topicPrompt;
        } catch (error: any) {
            console.error('Prompt generation error:', error);
            throw new Error('Failed to generate prompt from conversation');
        }
    }
}

export const imageService = new ImagePromptService();
