import React, { useState } from 'react';
import { X, Download, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { imageService } from '../services/imageService';
import { Message } from '../types';

interface ImageGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onImageGenerated: (imageData: string, prompt: string) => void;
    conversationMessages?: Message[];
}

export function ImageGenerationModal({
    isOpen,
    onClose,
    apiKey,
    onImageGenerated,
    conversationMessages = [],
}: ImageGenerationModalProps) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAutoGeneratePrompt = async () => {
        if (conversationMessages.length === 0) {
            setError('No conversation to analyze. Start chatting first!');
            return;
        }

        setIsGeneratingPrompt(true);
        setError(null);

        try {
            const generatedPrompt = await imageService.generatePromptFromConversation(
                conversationMessages.map(m => ({ role: m.role, content: m.content })),
                apiKey
            );
            setPrompt(generatedPrompt);
        } catch (err: any) {
            setError(err.message || 'Failed to generate prompt from conversation');
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for the image');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageData = await imageService.generateImage(prompt.trim(), apiKey);
            setGeneratedImage(imageData);
            onImageGenerated(imageData, prompt.trim());
        } catch (err: any) {
            setError(err.message || 'Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (generatedImage) {
            try {
                imageService.downloadImage(generatedImage, prompt);
            } catch (err: any) {
                setError(err.message || 'Failed to download image');
            }
        }
    };

    const handleClose = () => {
        setPrompt('');
        setGeneratedImage(null);
        setError(null);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
            e.preventDefault();
            handleGenerate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--color-text-primary)]" />
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Generate Image
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Input Section */}
                    <div className="space-y-4">
                        {/* Auto-generate prompt button */}
                        {conversationMessages && conversationMessages.length > 0 && (
                            <button
                                onClick={handleAutoGeneratePrompt}
                                disabled={isGeneratingPrompt || isGenerating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingPrompt ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing conversation...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" />
                                        Auto-Generate Prompt from Chat
                                    </>
                                )}
                            </button>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                Describe what you want to visualize
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Example: The water cycle process, Solar system structure, DNA replication..."
                                className="w-full p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                                rows={4}
                                disabled={isGenerating}
                            />
                            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                                ✨ Sakha will automatically apply its signature dark cosmic style
                            </p>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Image
                                </>
                            )}
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
                            </div>
                        )}

                        {/* Generated Image */}
                        {generatedImage && (
                            <div className="space-y-4">
                                <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                                    <img
                                        src={`data:image/png;base64,${generatedImage}`}
                                        alt={prompt}
                                        className="w-full h-auto"
                                    />
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] font-medium transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Image
                                </button>

                                {/* Success Message */}
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-sm text-green-400">
                                        ✨ Image generated successfully with Sakha's dark cosmic style!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
