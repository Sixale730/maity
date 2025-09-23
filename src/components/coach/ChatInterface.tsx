import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot } from 'lucide-react';
import { AgentState } from './CoachPage';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent';
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  agentState: AgentState;
}

export function ChatInterface({ messages, onSendMessage, agentState }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() && agentState === 'idle') {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-white/20">
        <Bot className="w-6 h-6 text-white" />
        <div>
          <h3 className="text-lg font-semibold text-white">Conversación con Coach</h3>
          <p className="text-sm text-white/70">
            {agentState === 'idle' ? 'En línea' : 'Procesando...'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-green-500'
                    : 'bg-purple-500'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </motion.div>

              {/* Message Bubble */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {agentState === 'thinking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/20 border border-white/30 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/70 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 border-t border-white/20"
      >
        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              agentState === 'idle'
                ? "Escribe tu mensaje..."
                : "Espera a que el coach termine de responder..."
            }
            disabled={agentState !== 'idle'}
            className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || agentState !== 'idle'}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-white/50 mt-2">
          Presiona Enter para enviar • Shift+Enter para nueva línea
        </p>
      </motion.div>
    </div>
  );
}