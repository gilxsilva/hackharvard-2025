'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askGemini } from '@/lib/gemini';

interface CentralHubProps {
  className?: string;
}

export default function CentralHub({ className = '' }: CentralHubProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter animation effect
  useEffect(() => {
    if (response && !typing) {
      setTyping(true);
      setDisplayedResponse('');
      
      let currentIndex = 0;
      
      const typeNextCharacter = () => {
        if (currentIndex < response.length) {
          setDisplayedResponse(response.slice(0, currentIndex + 1));
          currentIndex++;
          typewriterRef.current = setTimeout(typeNextCharacter, Math.random() * 30 + 20); // Random typing speed between 20-50ms
        } else {
          setTyping(false);
        }
      };
      
      typeNextCharacter();
    }
    
    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse('');
    setDisplayedResponse('');
    setTyping(false);
    
    // Clear any existing typewriter animation
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }
    
    try {
      const result = await askGemini(query);
      setResponse(result);
    } catch (error) {
      console.error('Chat error:', error);
      setResponse('Sorry, I couldn\'t process your request. Please try again.');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Collapsed Orb */}
      {!isExpanded && (
        <div
          className={`fixed inset-0 m-auto w-32 h-32 z-20 cursor-pointer group ${className}`}
          onClick={() => setIsExpanded(true)}
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse-glow blur-xl" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-breathing" />

          {/* Main orb */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 shadow-2xl flex items-center justify-center animate-breathing">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>

          {/* Orbit lines */}
          <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-pulse" />
          <div className="absolute inset-[-8px] rounded-full border border-blue-500/10" />
        </div>
      )}

      {/* Expanded Chat Panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] bg-gradient-to-br from-zinc-900/95 to-black/95 rounded-3xl border border-purple-500/30 shadow-[0_0_60px_rgba(139,92,246,0.5)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-breathing">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Chrona Assistant</h2>
                  <p className="text-sm text-gray-400">Ask about your schedule, classes, or assignments</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {(displayedResponse || loading) ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    {loading ? (
                      <div className="flex items-center space-x-3 text-gray-400">
                        <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                        <span className="text-sm">Analyzing your Canvas data...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* AI Response Header */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-gray-300">Chrona AI</span>
                          </div>
                          {typing && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Markdown Formatted Response */}
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom styling for markdown elements with dark theme
                              strong: ({ children }) => (
                                <strong className="font-semibold text-white">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-300">{children}</em>
                              ),
                              p: ({ children }) => (
                                <p className="text-gray-300 leading-relaxed mb-3 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-2">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-gray-300">{children}</li>
                              ),
                              code: ({ children }) => (
                                <code className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm font-mono border border-purple-500/30">{children}</code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-3 bg-purple-500/5 py-2">{children}</blockquote>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold text-white mb-3 border-b border-white/20 pb-2">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold text-white mb-2">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-medium text-gray-200 mb-2">{children}</h3>
                              ),
                            }}
                          >
                            {displayedResponse}
                          </ReactMarkdown>
                          {typing && (
                            <span className="inline-block w-3 h-5 bg-purple-500 animate-pulse ml-1 rounded-sm"></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">How can I help you today?</h3>
                    <p className="text-sm text-gray-400">
                      Ask about your schedule, upcoming assignments, or grades
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {[
                      "What's my schedule today?",
                      "What assignments are due soon?",
                      "How are my grades looking?"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(suggestion)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs text-gray-300 border border-white/10 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about your academics..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  disabled={loading || typing}
                />
                <button
                  type="submit"
                  disabled={loading || typing || !query.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Thinking...</span>
                    </>
                  ) : typing ? (
                    <>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="hidden sm:inline">Typing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
