import { useState, useEffect, useRef } from 'react';
import { HiOutlineChatBubbleLeftEllipsis, HiOutlineXMark, HiOutlinePaperAirplane, HiOutlineSparkles, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import api from '../../services/api';

// Simple markdown-lite renderer
const renderMarkdown = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
};

const MessageBubble = ({ msg }) => {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 mr-2 mt-1">
          <HiOutlineSparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isBot
            ? 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-sm border border-surface-100 dark:border-surface-700'
            : 'bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-tr-sm'
        }`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
      />
    </div>
  );
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 **Selam!** I'm **EtBot**, EtGebeya's AI assistant.\n\nI can help you buy, sell, find deals, and stay safe from scams. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(['How do I sell?', 'Am I safe from scams?', 'AI features', 'Contact admin']);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setQuickReplies([]);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // Typing indicator
    setMessages(prev => [...prev, { role: 'bot', text: '...', isTyping: true }]);

    try {
      // Filter out typing placeholders so they are never sent to the backend
      const cleanHistory = messages
        .filter(m => !m.isTyping)
        .map(m => ({ role: m.role, text: m.text }));

      const response = await api.post(
        '/ai/chatbot.php',
        { message: userText, history: cleanHistory },
        { timeout: 25000 } // Gemini + DB query can take up to ~15 s
      );

      const { reply, quickReplies: qr } = response.data.data;
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { role: 'bot', text: reply },
      ]);
      if (qr?.length) setQuickReplies(qr);

      if (!isOpen) setUnread(u => u + 1);
    } catch (err) {
      // Try to surface any reply the backend included in an error response
      const fallbackReply =
        err?.response?.data?.data?.reply ||
        "😔 Sorry, I'm having trouble connecting. Please try again or contact admin at **admin@etgebeya.com**.";
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { role: 'bot', text: fallbackReply },
      ]);
      setQuickReplies(['Try again', 'Contact admin']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 group"
        aria-label="Open AI Chat Support"
      >
        {isOpen ? (
          <HiOutlineXMark className="w-6 h-6" />
        ) : (
          <>
            <HiOutlineChatBubbleLeftEllipsis className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden animate-slide-up"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">EtBot — AI Support</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                <p className="text-white/80 text-xs">Online • AI-Powered</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-surface-50 dark:bg-surface-900/50">
            {messages.map((msg, idx) => (
              msg.isTyping ? (
                <div key={idx} className="flex justify-start mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-surface-800 rounded-2xl rounded-tl-sm border border-surface-100 dark:border-surface-700 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <MessageBubble key={idx} msg={msg} />
