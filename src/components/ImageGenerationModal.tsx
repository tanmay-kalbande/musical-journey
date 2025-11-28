import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { imageService } from '../services/imageService';
import { Message } from '../types';

interface ImageGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    conversationMessages?: Message[];
}

export function ImageGenerationModal({
    isOpen,
    onClose,
    apiKey,
    conversationMessages = [],
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
                apiKey
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
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                AI Image Prompt Generator
                            </h2>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                Auto-generated from your conversation
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                                <Sparkles className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                                Analyzing your conversation and crafting the perfect prompt...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    ) : generatedPrompt ? (
                        <div className="space-y-4">
                            {/* Generated Prompt Display */}
                            <div className="relative">
                                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-5 max-h-[50vh] overflow-y-auto">
                                    <pre className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap font-mono leading-relaxed">
                                        {generatedPrompt}
                                    </pre>
                                </div>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        Copy Prompt
                                    </>
                                )}
                            </button>

                            {/* Instructions */}
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <p className="text-sm text-blue-300 leading-relaxed">
                                    <span className="font-semibold">✨ Ready to use!</span> Copy this prompt and paste it into:
                                    <br />
                                    • <strong>Gemini</strong> (Google's Imagen)
                                    <br />
                                    • <strong>DALL-E 3</strong> (OpenAI)
                                    <br />
                                    • <strong>Midjourney</strong>
                                    <br />• <strong>Stable Diffusion</strong>
                                </p>
                            </div>

                            {/* Regenerate Button */}
                            <button
                                onClick={handleGeneratePrompt}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] text-sm font-medium transition-all disabled:opacity-50"
                            >
                                <Sparkles className="w-4 h-4" />
                                Regenerate Prompt
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[var(--color-text-secondary)]">
                            No prompt generated yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
