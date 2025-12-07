import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hi! I'm your learning companion. I've prepared your plan. Ready to get started?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "That sounds great! Keep going. Use the checkboxes to track your progress." 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-900 border-l border-neutral-800">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="font-semibold text-white">Companion</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
              msg.sender === 'user' 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-neutral-800 text-neutral-200 rounded-bl-none"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
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
  );
}
