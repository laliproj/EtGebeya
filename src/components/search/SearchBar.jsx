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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.success) {
        const { results, detectedCategory, detectedBrand } = response.data.data;
        setVisualResults({ results, detectedCategory, detectedBrand });
        setSuggestions([]);
        const label = [detectedBrand, detectedCategory].filter(Boolean).join(' ') || 'electronics';
        toast.success(`Found ${results.length} similar ${label} listings!`);
      }
    } catch {
      toast.error('Visual search failed. Please try a clearer image.');
    } finally {
      setIsVisualSearching(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input Row */}
      <div className="relative flex items-center">
        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search phones, laptops, headphones..."
          className="w-full pl-10 pr-20 py-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200"
        />

        {/* Right action buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Voice Search */}
          <button
            onClick={handleVoiceSearch}
            title="Voice Search"
            className={`p-1.5 rounded-lg transition-colors ${
              isListening
                ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 animate-pulse'
                : 'text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            <HiOutlineMicrophone className="w-4 h-4" />
          </button>

          {/* Visual Search */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Search by Image"
            disabled={isVisualSearching}
            className="p-1.5 rounded-lg text-surface-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors disabled:opacity-40"
          >
            {isVisualSearching
              ? <div className="w-4 h-4 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
              : <HiOutlineCamera className="w-4 h-4" />
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleVisualSearch}
            className="hidden"
          />
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50 animate-slide-down"
        >
          {/* Visual Search Results */}
          {visualResults && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-accent-500" />
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                  Visual Match — {[visualResults.detectedBrand, visualResults.detectedCategory].filter(Boolean).join(' ')}
                </p>
              </div>
              {visualResults.results.length === 0 ? (
                <p className="text-sm text-surface-500 px-3 pb-3">No similar products found. Try a different photo.</p>
              ) : (
                visualResults.results.slice(0, 5).map(product => (
                  <div
                    key={product.id}
                    onClick={() => { setShowDropdown(false); navigate(`/products/${product.id}`); }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 rounded-lg cursor-pointer"
                  >
                    {product.images[0] && (
                      <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{product.title}</p>
                      <p className="text-xs text-primary-600 font-semibold">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                ))
              )}
              {visualResults.results.length > 5 && (
                <button
                  onClick={() => { setShowDropdown(false); navigate(`/products?category=${visualResults.detectedCategory || ''}`); }}
                  className="w-full text-center text-xs text-primary-600 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  View all {visualResults.results.length} similar products →
                </button>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {!visualResults && query.length === 0 && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-3 py-2">
                Recent Searches
              </p>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 rounded-lg cursor-pointer group"
                >
                  <div className="flex items-center gap-3 flex-1" onClick={() => { setQuery(search); handleSearch(search); }}>
                    <HiOutlineClock className="w-4 h-4 text-surface-400" />
                    <span className="text-sm text-surface-700 dark:text-surface-300">{search}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); clearRecent(search); }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface-200 dark:hover:bg-surface-600 rounded transition-all"
                  >
                    <HiOutlineXMark className="w-3 h-3 text-surface-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Suggestions */}
          {!visualResults && suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-primary-500" />
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">AI Suggestions</p>
              </div>
              {suggestions.map(product => (
                <div
                  key={product.id}
                  onClick={() => { setShowDropdown(false); navigate(`/products/${product.id}`); }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700 rounded-lg cursor-pointer"
                >
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{product.title}</p>
                    <p className="text-xs text-primary-600 font-semibold">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!visualResults && query.length > 2 && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-surface-500">No results for "{query}"</p>
              <p className="text-xs text-surface-400 mt-1">Try voice 🎙️ or photo 📷 search!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
