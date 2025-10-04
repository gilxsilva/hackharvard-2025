'use client';

import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { askGemini } from '@/lib/gemini';

export default function ChatBar() {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Ask about your schedule</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do I have today? When is my next class?"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      
      {response && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{response}</p>
        </div>
      )}
    </div>
  );
}