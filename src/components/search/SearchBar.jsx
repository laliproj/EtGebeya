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
