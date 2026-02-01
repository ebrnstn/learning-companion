import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, X, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { sendMessageToGemini } from '../lib/gemini';

export default function ChatInterface({ plan, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your learning companion. I can help answer questions about your plan or explain concepts. What are we working on?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await sendMessageToGemini(messages, input, plan);

        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
        console.error("Gemini Error:", error);
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my brain right now. Please check your API key." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header: history toggle top-left, title center, close right */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            'p-2 -ml-2 rounded-lg transition-colors flex-shrink-0',
            showHistory ? 'text-blue-400 bg-blue-500/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          )}
          aria-label={showHistory ? 'Hide history' : 'Show history'}
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0" />
          <span className="font-semibold text-white truncate">Companion</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-lg text-neutral-400 hover:text-white transition-colors hover:bg-neutral-800 flex-shrink-0"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* History sidebar (left, standard LLM pattern) */}
        {showHistory && (
          <aside className="flex-shrink-0 w-56 border-r border-neutral-800 bg-neutral-900/50 flex flex-col">
            <div className="p-3 border-b border-neutral-800">
              <button
                onClick={() => setShowHistory(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
            <div className="p-3 flex-1 overflow-y-auto">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-2">Conversations</p>
              <p className="text-sm text-neutral-500">Previous chats will appear here.</p>
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm overflow-hidden",
              msg.role === 'user' 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-neutral-800 text-neutral-200 rounded-bl-none"
            )}>
              {msg.role === 'user' ? (
                 <p>{msg.content}</p>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none break-words whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-neutral-800 text-neutral-200 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-neutral-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full bg-neutral-800/50 border border-neutral-700 text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-neutral-700"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
