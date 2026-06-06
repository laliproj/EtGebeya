import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineClock, HiOutlineXMark, HiOutlineMicrophone, HiOutlineCamera, HiOutlineSparkles } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const [visualResults, setVisualResults] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ─── Smart AI Search ────────────────────────────────────────────────────────
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setVisualResults(null);
    if (value.length > 2) {
      try {
        const response = await api.get(`/ai/smart_search.php?q=${encodeURIComponent(value)}`);
        if (response.data?.success) {
          setSuggestions(response.data.data.results.slice(0, 5));
          setShowDropdown(true);
        }
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(value.length === 0 && recentSearches.length > 0);
    }
  };

  const handleSearch = (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setShowDropdown(false);
    setVisualResults(null);
    navigate(`/products?search=${encodeURIComponent(q)}`);
    if (onSearch) onSearch();
  };

  const clearRecent = (searchTerm) => {
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // ─── Voice Search ───────────────────────────────────────────────────────────
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in your browser. Try Chrome!');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    toast('🎙️ Listening... Speak now!', { duration: 3000 });
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      toast.success(`Heard: "${transcript}"`);
      // Auto-submit after hearing
      setTimeout(() => handleSearch(transcript), 400);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Could not understand. Please try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // ─── Visual Search ──────────────────────────────────────────────────────────
  const handleVisualSearch = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVisualSearching(true);
    setShowDropdown(true);
    toast('📷 Analyzing image with AI...', { duration: 2000 });
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/ai/visual_search.php', formData, {
