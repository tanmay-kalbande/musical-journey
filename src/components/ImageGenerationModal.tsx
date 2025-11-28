import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import { imageService } from '../services/imageService';
import { Message } from '../types';

interface ImageGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    conversationMessages?: Message[];
    modelName?: string;
}

export function ImageGenerationModal({
    isOpen,
    onClose,
    apiKey,
    conversationMessages = [],
    modelName = 'gemini-2.5-flash',
}: ImageGenerationModalProps) {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Auto-generate on open
    useEffect(() => {
        if (isOpen && conversationMessages.length > 0 && !generatedPrompt && !isGenerating) {
            handleGeneratePrompt();
        }
    }, [isOpen]);

    const handleGeneratePrompt = async () => {
        if (conversationMessages.length === 0) {
            setError('No conversation to analyze. Start chatting first!');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const prompt = await imageService.generateFullPromptFromConversation(
                conversationMessages.map(m => ({ role: m.role, content: m.content })),
                apiKey,
                modelName
            );
            setGeneratedPrompt(prompt);
        } catch (err: any) {
            setError(err.message || 'Failed to generate prompt');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Failed to copy to clipboard');
        }
    };

    const handleClose = () => {
        setGeneratedPrompt('');
        setError(null);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel w-full max-w-2xl rounded-xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--color-text-primary)]" />
                        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                            Image Prompt Generator
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        ) : error ? (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                        ) : generatedPrompt ? (
                        <div className="space-y-4">
                            {/* Prompt Display */}
                            <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                                    {generatedPrompt}
                                </p>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Prompt
                                    </>
                                )}
                            </button>

                            {/* Info */}
                            <p className="text-xs text-[var(--color-text-secondary)] text-center">
                                Paste into Gemini, DALL-E, Midjourney, or Stable Diffusion
                            </p>

                            {/* Regenerate */}
                            <button
                                onClick={handleGeneratePrompt}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-secondary)] rounded-lg text-[var(--color-text-secondary)] text-xs font-medium transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Regenerate
                            </button>
                        </div>
                        ) : (
                        <div className="text-center py-8 text-[var(--color-text-secondary)] text-sm">
                            Start chatting to generate prompts
                        </div>
          )}
                </div>
            </div>
        </div>
    );
}
