'use client';

import { useState, useEffect } from 'react';
import { Send, MessageCircle, Bot, User } from 'lucide-react';
import { askGemini } from '@/lib/geminiApi';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ChatBar() {
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Simple typewriter effect
  const typeMessage = (message: string, messageId: string) => {
    setIsTyping(true);
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= message.length) {
        setMessages(prev => {
          const newMessages = [...prev];
          const msgIndex = newMessages.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            newMessages[msgIndex] = {
              ...newMessages[msgIndex],
              content: message.slice(0, currentIndex)
            };
          }
          return newMessages;
        });
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 30);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuery('');

    try {
      const result = await askGemini(userMessage.content);
      
      // Create AI message and start typing effect  
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
      
      // Start typewriter effect
      typeMessage(result, aiMessageId);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I couldn\'t process your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  // Format AI response with proper line breaks and formatting
  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Handle bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={index} className="flex items-start space-x-2 my-1">
              <span className="text-purple-400 mt-1">•</span>
              <span>{line.replace(/^[•-]\s*/, '')}</span>
            </div>
          );
        }
        // Handle bold text (markdown-style)
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p key={index} className={line.trim() ? 'mb-2' : 'mb-1'} dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        );
      });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-64 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Ask me anything about your schedule, assignments, or courses!</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setQuery("What do I have today?")}
                className="block w-full text-left px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                "What do I have today?"
              </button>
              <button
                onClick={() => setQuery("When is my next assignment due?")}
                className="block w-full text-left px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                "When is my next assignment due?"
              </button>
              <button
                onClick={() => setQuery("How are my grades looking?")}
                className="block w-full text-left px-3 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                "How are my grades looking?"
              </button>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'user' 
                ? 'bg-gradient-to-br from-green-500 to-teal-500' 
                : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}>
              {message.type === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`flex-1 p-3 rounded-xl ${
              message.type === 'user' 
                ? 'bg-green-600/20 border border-green-500/30' 
                : 'bg-zinc-800/50 border border-zinc-700'
            }`}>
              <div className="text-sm text-white leading-relaxed">
                {message.type === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <div>
                    {formatMessage(message.content)}
                    {message.type === 'ai' && isTyping && message.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-1 align-middle" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-purple-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center min-w-[80px]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}