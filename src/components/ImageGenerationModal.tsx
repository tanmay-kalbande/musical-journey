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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                {/* Header */}
                <div className="relative p-6 border-b border-white/10">
                    {/* Cosmic gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-purple-600/20 opacity-50"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 backdrop-blur-sm">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    AI Prompt Generator
                                </h2>
                                <p className="text-sm text-white/60">
                                    Powered by Gemini • Optimized for Sakha
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-white/60 animate-spin"></div>
                                <Sparkles className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-white/80 text-base font-medium mb-2">
                                    Analyzing conversation...
                                </p>
                                <p className="text-white/50 text-sm">
                                    Crafting the perfect image prompt with Sakha's style
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="glass-panel p-5 border border-red-500/30 bg-red-500/10 rounded-xl">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    ) : generatedPrompt ? (
                        <div className="space-y-5">
                            {/* Generated Prompt Display */}
                            <div className="glass-panel p-6 rounded-xl border border-white/10 bg-black/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                        Generated Prompt
                                    </span>
                                </div>
                                <div className="max-h-[40vh] overflow-y-auto custom-scrollbar">
                                    <pre className="text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed">
                                        {generatedPrompt}
                                    </pre>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 gap-3">
                                {/* Copy Button */}
                                <button
                                    onClick={handleCopy}
                                    className="relative group overflow-hidden rounded-xl p-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-[length:200%_100%] animate-gradient"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center justify-center gap-2">
                                        {copied ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                <span>Copied to Clipboard!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                                <span>Copy Prompt</span>
                                            </>
                                        )}
                                    </div>
                                </button>

                                {/* Info Card */}
                                <div className="glass-panel p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-white/70 leading-relaxed">
                                            <span className="font-semibold text-blue-300">Ready to create!</span> Paste this into <strong className="text-white/90">Gemini</strong>, <strong className="text-white/90">DALL-E</strong>, <strong className="text-white/90">Midjourney</strong>, or <strong className="text-white/90">Stable Diffusion</strong> to generate beautiful educational images with Sakha's signature style.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Regenerate */}
                            <button
                                onClick={handleGeneratePrompt}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 glass-panel rounded-lg hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Sparkles className="w-4 h-4" />
                                Regenerate Prompt
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-white/50">
                            No prompt generated yet
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    );
}
