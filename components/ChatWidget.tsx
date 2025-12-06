import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { projectService } from '../services/projectService';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am Nobel\'s AI assistant. Ask me anything about his work or experience.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Detect footer overlap
  useEffect(() => {
    const handleScroll = () => {
        const footer = document.getElementById('footer');
        if (!footer) return;
        
        const rect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Check if footer is visible in the viewport
        if (rect.top < windowHeight) {
            setIsOverFooter(true);
        } else {
            setIsOverFooter(false);
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to safely extract text from various n8n response structures
  const extractTextFromResponse = (data: any): string => {
    console.log("Parsing response data:", data); // Debug log

    if (!data) return '';
    if (typeof data === 'string') return data;
    
    // Handle Array response (common in n8n)
    if (Array.isArray(data)) {
      if (data.length > 0) {
        return extractTextFromResponse(data[0]);
      }
      return '';
    }

    if (typeof data === 'object') {
      // Prioritize specific keys
      if (data.output && typeof data.output === 'string') return data.output;
      if (data.text && typeof data.text === 'string') return data.text;
      if (data.response && typeof data.response === 'string') return data.response;
      if (data.message && typeof data.message === 'string') return data.message;
      if (data.content && typeof data.content === 'string') return data.content;
      
      // Fallback: Check if there's a 'body' or 'data' nested object
      if (data.body) return extractTextFromResponse(data.body);
      
      // Fallback: Return the first string property found
      const values = Object.values(data);
      for (const val of values) {
        if (typeof val === 'string' && val.length > 0) return val;
      }
    }
    
    return JSON.stringify(data); // Last resort
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage: ChatMessage = { role: 'user', text: userText };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save User Log to DB
    projectService.saveChatInteraction('user', userText);

    try {
      // Prepare history in a clean format
      const cleanHistory = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      console.log("Sending request to n8n...");

      const response = await fetch('https://n8n.srv915514.hstgr.cloud/webhook/bff1b7e3-59b3-46a0-89c4-acb0495909c6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chatInput: userText, // Common n8n input key
          message: userText,   // Alternative key
          history: cleanHistory.slice(-10) // Limit context window
        }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      let aiResponseText = '';

      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json();
        aiResponseText = extractTextFromResponse(jsonData);
      } else {
        aiResponseText = await response.text();
      }

      if (!aiResponseText || aiResponseText === '{}') {
          aiResponseText = "I received an empty response. Please check the n8n workflow output.";
      }

      // Save AI Log to DB
      projectService.saveChatInteraction('model', aiResponseText);

      setMessages(prev => [...prev, { role: 'model', text: aiResponseText }]);

    } catch (error) {
      console.error('Chat Widget Error:', error);
      let errorMessage = 'Sorry, I encountered an error connecting to the AI.';
      
      if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
             errorMessage += ' (Network/CORS Error)';
          } else {
             errorMessage += ` (${error.message})`;
          }
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
        className={`fixed z-50 flex flex-col items-end pointer-events-auto transition-all duration-300 right-6 md:right-8 ${
            isOverFooter ? 'bottom-6 md:bottom-24' : 'bottom-6 md:bottom-8'
        }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[340px] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col font-sans"
            style={{ height: '550px', maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                    <Sparkles size={16} className="text-blue-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">Nobel Assistant</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Online</span>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Role Label */}
                    <span className="text-[10px] text-gray-400 mb-1 ml-1">
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    
                    {/* Bubble */}
                    <div 
                        className={`p-3.5 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                            ? 'bg-black text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-sm'
                        }`}
                    >
                        {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                  <div className="flex justify-start w-full">
                      <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="bg-transparent flex-1 outline-none text-sm text-gray-800 placeholder-gray-500 min-w-0"
                  disabled={isLoading}
                  autoFocus
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    input.trim() 
                        ? 'bg-black text-white shadow-md hover:scale-105 active:scale-95' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />}
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">Powered by n8n & Gemini</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all z-50 group ${
            isOverFooter 
            ? 'bg-white text-black shadow-[0_8px_30px_rgb(255,255,255,0.2)]' 
            : 'bg-black text-white shadow-[0_8px_30px_rgb(0,0,0,0.3)]'
        }`}
      >
        <AnimatePresence mode="wait">
            {isOpen ? (
                 <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                 >
                     <X size={24} />
                 </motion.div>
            ) : (
                <motion.div
                    key="chat"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                 >
                    <MessageSquare size={24} className="fill-current" />
                </motion.div>
            )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;