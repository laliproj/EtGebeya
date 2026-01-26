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
