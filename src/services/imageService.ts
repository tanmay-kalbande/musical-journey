// Image generation service using Gemini 2.0 Flash Preview Image Generation
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

export interface GeneratedImage {
    id: string;
    prompt: string;
    imageData: string; // base64
    createdAt: Date;
}

class ImageGenerationService {
    /**
     * Generate an image using Gemini 2.0 Flash Preview Image Generation
     * Automatically applies Sakha's brand style to the user's prompt
     */
    async generateImage(userPrompt: string, apiKey: string): Promise<string> {
        if (!apiKey) {
            throw new Error('Google API key is required for image generation');
        }

        if (!userPrompt.trim()) {
            throw new Error('Please provide a description for the image');
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);

            // Use Imagen 3 which is available through the generative AI SDK
            const model = genAI.getGenerativeModel({
                model: "imagen-3.0-generate-001"
            });

            // Combine Sakha style prompt with user's request
            const fullPrompt = SAKHA_STYLE_PROMPT + userPrompt;

            // Generate image with highest quality settings
            const result = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    // Request highest quality
                    temperature: 0.4, // Lower for more consistent style
                }
            });

            const response = result.response;

            // Extract image data from response
            // The response should contain the generated image
            if (!response) {
                throw new Error('No response from image generation API');
            }

            // Get the first candidate's image data
            const candidate = response.candidates?.[0];
            if (!candidate) {
                throw new Error('No image generated');
            }

            // Extract base64 image data from the response
            // Note: The actual structure may vary, adjust based on API response
            const imageData = candidate.content?.parts?.[0]?.inlineData?.data;

            if (!imageData) {
                throw new Error('Failed to extract image data from response');
            }

            return imageData;
        } catch (error: any) {
            console.error('Image generation error:', error);

            // Handle specific error cases
            if (error.message?.includes('quota')) {
                throw new Error('Daily image generation limit reached (100/day). Please try again tomorrow.');
            } else if (error.message?.includes('rate limit')) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            } else if (error.message?.includes('API key')) {
                throw new Error('Invalid API key. Please check your Google API settings.');
            }

            throw new Error(error.message || 'Failed to generate image. Please try again.');
        }
    }

    /**
     * Download generated image as PNG file
     */
    downloadImage(imageData: string, prompt: string) {
        try {
            // Create a download link
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${imageData}`;

            // Create a safe filename from the prompt
            const safeFilename = prompt
                .substring(0, 50) // Limit length
                .replace(/[^a-z0-9]/gi, '_') // Replace special chars
                .toLowerCase();

            link.download = `sakha_${safeFilename}_${Date.now()}.png`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error('Failed to download image');
        }
    }
}

export const imageService = new ImageGenerationService();
