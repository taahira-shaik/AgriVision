import React, { useState, useRef, useEffect } from 'react';
import { getAdvisoryResponse } from '../services/geminiService';
import { 
  Send, User, Bot, Loader2, Mic, Copy, Check, Sparkles, 
  ChevronRight, Info, AlertCircle, CheckCircle2, Languages, MicOff
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const QuickAction: React.FC<{ label: string; onClick: () => void | Promise<void>; icon: any; color: string }> = ({ label, onClick, icon: Icon, color }) => (
  <button 
    onClick={() => onClick()}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border backdrop-blur-md transition-all hover:scale-105 hover:shadow-md active:scale-95 whitespace-nowrap shadow-sm font-semibold text-[10px] sm:text-xs ${color}`}
  >
    <Icon size={12} className="opacity-80" />
    {label}
  </button>
);

const FormattedMessage = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        let trimmed = line.trim();
        
        // Render Headings - Clean and professional
        if (trimmed.startsWith('###')) {
          return (
            <div key={i} className="flex items-center gap-2 mt-2.5 first:mt-0 mb-0.5">
              <div className="h-3.5 w-0.5 bg-green-500 rounded-full"></div>
              <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">
                {trimmed.replace(/^###\s*/, '').trim()}
              </h3>
            </div>
          );
        }

        // Render Lists - Explicitly stripping '*', '-', or '+' and using UI bullets
        if (trimmed.match(/^[\*\-\+]\s/)) {
          const content = trimmed.replace(/^[\*\-\+]\s*/, '');
          return (
            <div key={i} className="flex gap-2 ml-0.5 bg-slate-50/40 p-1.5 rounded-lg border border-slate-100/50 group">
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 size={13} className="text-green-500" />
              </div>
              <span className="text-slate-700 text-[11px] sm:text-[13px] leading-relaxed">
                {parseBold(content)}
              </span>
            </div>
          );
        }

        if (!trimmed) return <div key={i} className="h-0.5" />;

        // Default Paragraph - Compact font size
        return (
          <p key={i} className="text-slate-700 text-[11px] sm:text-[13px] leading-relaxed">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={j} className="text-slate-900 font-bold bg-green-50/50 px-0.5 rounded">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const FarmerAdvisory: React.FC = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Namaste! I am your **AgriBot** expert.\n\n### Current Focus:\n*   **Disease Prevention**: Seasonal alerts for your region.\n*   **Market Optimization**: When to sell for maximum profit.\n*   **Precision Irrigation**: Data-driven water management.\n\nHow can I assist your farm today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // Default, can be improved to detect regional languages

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = async (textToSend: string = input) => {
    const trimmedInput = textToSend.trim();
    if (!trimmedInput || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      text: trimmedInput,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.isUser ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const responseText = await getAdvisoryResponse(history, userMsg.text);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: responseText || "I encountered a minor issue. Please rephrase your query.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { label: "Pest Treatment", icon: Sparkles, color: "bg-amber-100/60 text-amber-900 border-amber-200" },
    { label: "Soil Health", icon: Info, color: "bg-emerald-100/60 text-emerald-900 border-emerald-200" },
    { label: "Hindi Guidance", icon: Languages, color: "bg-indigo-100/60 text-indigo-900 border-indigo-200" },
    { label: "Yield Tips", icon: ChevronRight, color: "bg-blue-100/60 text-blue-900 border-blue-200" },
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative mx-auto w-full max-w-full" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-gradient-to-tr from-green-100 to-blue-100"></div>

      {/* Header - More expansive feel */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white shadow-lg transform transition-transform hover:rotate-0 -rotate-2">
              <Bot size={24} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">AgriBot Assistant</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">System Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden sm:block px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">v3.5 Flash Core</span>
           </div>
        </div>
      </div>

      {/* Message Stream - Occupying most of the container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 space-y-8 z-10 scroll-smooth bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:24px_24px]">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-400`}
          >
            <div className={`flex max-w-[98%] sm:max-w-[80%] gap-3.5 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.isUser 
                  ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white rotate-1' 
                  : 'bg-white border border-slate-100 text-emerald-600 -rotate-1'
              }`}>
                {msg.isUser ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="space-y-1.5">
                <div 
                  className={`p-4 rounded-2xl shadow-sm relative group ${
                    msg.isUser 
                      ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-tr-none border-b border-emerald-800/20' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none border-b border-slate-200/50'
                  }`}
                >
                  <FormattedMessage text={msg.text} />
                  
                  {!msg.isUser && (
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        {copiedId === msg.id ? 'Saved' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
                <div className={`text-[8px] px-1 font-bold uppercase tracking-widest text-slate-400 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-200">
             <div className="flex gap-4 bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-lg items-center border-b-2 border-slate-100">
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">Expert Consultation...</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">AI Analysis In Progress</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section - Optimized for clarity */}
      <div className="p-5 md:p-6 bg-white border-t border-slate-100 space-y-5 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
        {/* Chips - Compact size */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar px-1">
          {quickActions.map((action, idx) => (
            <QuickAction 
              key={idx} 
              label={action.label} 
              icon={action.icon} 
              color={action.color} 
              onClick={() => handleSend(action.label)}
            />
          ))}
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
          className={`flex gap-3 items-center p-2 rounded-2xl border transition-all shadow-inner ${
            isListening 
              ? 'bg-red-50 border-red-300 ring-4 ring-red-100' 
              : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5'
          }`}
        >
          <button 
            type="button" 
            onClick={toggleListening}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-200' 
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-100/50'
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type or speak your agricultural query..."}
            className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-slate-800 text-[13px] font-medium placeholder:text-slate-400"
          />
          
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shadow-md ${
              !input.trim() || loading 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
        
        <div className="flex items-center justify-center gap-4 py-1">
           <div className="h-[1px] flex-1 bg-slate-100"></div>
           <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.25em]">Precision Agriculture Intelligence</p>
           <div className="h-[1px] flex-1 bg-slate-100"></div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAdvisory;
