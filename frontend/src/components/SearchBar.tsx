'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { songsApi, singersApi, topicsApi } from '@/lib/api';

interface SearchSuggestion {
  id: string;
  type: 'song' | 'singer' | 'topic';
  title: string;
  subtitle?: string;
  avatar?: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Tìm kiếm bài hát, nghệ sĩ...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const [songsRes, singersRes, topicsRes] = await Promise.all([
        songsApi.getAll(`search=${encodeURIComponent(searchQuery)}&limit=5`),
        singersApi.getAll(`search=${encodeURIComponent(searchQuery)}&limit=3`),
        topicsApi.getAll()
      ]);

      const songs = (songsRes as any).data || songsRes || [];
      const singers = (singersRes as any).data || singersRes || [];
      const topics = Array.isArray(topicsRes) ? topicsRes : ((topicsRes as any).data || []);

      // Filter by query
      const filteredSongs = songs
        .filter((s: any) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
        .map((s: any) => ({
          id: s.id,
          type: 'song' as const,
          title: s.title,
          subtitle: s.singer?.fullName || 'Nghệ sĩ',
          avatar: s.avatar,
        }));

      const filteredSingers = singers
        .filter((s: any) => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map((s: any) => ({
          id: s.id,
          type: 'singer' as const,
          title: s.fullName,
          subtitle: 'Nghệ sĩ',
          avatar: s.avatar,
        }));

      const filteredTopics = topics
        .filter((t: any) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 2)
        .map((t: any) => ({
          id: t.id,
          type: 'topic' as const,
          title: t.title,
          subtitle: 'Chủ đề',
          avatar: t.avatar,
        }));

      setSuggestions([...filteredSongs, ...filteredSingers, ...filteredTopics]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(value.trim().length > 0);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    setShowSuggestions(false);
    setQuery(searchQuery);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'song') {
      handleSearch(suggestion.title);
    } else if (suggestion.type === 'singer') {
      router.push(`/singer/${suggestion.id}`);
    } else if (suggestion.type === 'topic') {
      router.push(`/topic/${suggestion.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Voice Search (Web Speech API)
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      if (event.error === 'no-speech') {
        alert('Không nhận diện được giọng nói. Vui lòng thử lại.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const clearRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== search);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className={`search-bar ${className}`} ref={searchRef} style={{ position: 'relative' }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
        {/* Search icon inside input */}
        <i 
          className="bx bx-search" 
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '16px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        {/* Voice search icon inside input (right side) */}
        <button
          type="button"
          className={`voice-search-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceSearch}
          title="Tìm kiếm bằng giọng nói"
          style={{
            position: 'absolute',
            right: '48px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isListening ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.2s',
            zIndex: 1,
            padding: '4px',
          }}
        >
          <i className={`bx ${isListening ? 'bx-microphone-off' : 'bx-microphone'}`} style={{ fontSize: 18 }}></i>
          {isListening && <span className="voice-indicator"></span>}
        </button>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0 || recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            padding: '10px 30px 10px 42px',
            width: '100%',
            transition: 'var(--transition)',
          }}
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          className="search-suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {/* Loading state */}
          {isLoading && (
            <div style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="bx bx-loader-alt bx-spin"></i> Đang tìm...
            </div>
          )}

          {/* No results */}
          {!isLoading && query.trim().length >= 2 && suggestions.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <i className="bx bx-search" style={{ fontSize: 24, marginBottom: 8, display: 'block' }}></i>
              Không tìm thấy kết quả nào
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div>
              <div style={{ 
                padding: '8px 16px', 
                fontSize: '11px', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border)',
              }}>
                Gợi ý
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: index === selectedIndex ? 'var(--bg-hover)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    setSelectedIndex(index);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    setSelectedIndex(-1);
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: 'var(--gradient-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {suggestion.avatar ? (
                      <img 
                        src={suggestion.avatar} 
                        alt={suggestion.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <i className={`bx ${
                        suggestion.type === 'song' ? 'bxs-music' :
                        suggestion.type === 'singer' ? 'bxs-user' :
                        'bxs-folder'
                      }`} style={{ fontSize: 18, color: 'var(--text-muted)' }}></i>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {suggestion.title}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-muted)',
                    }}>
                      {suggestion.subtitle}
                    </div>
                  </div>
                  <i className="bx bx-chevron-right" style={{ color: 'var(--text-muted)', fontSize: 18 }}></i>
                </div>
              ))}
            </div>
          )}

          {/* Recent searches - show when no query or short query */}
          {!isLoading && (query.trim().length === 0 || query.trim().length < 2) && recentSearches.length > 0 && (
            <div>
              <div style={{ 
                padding: '8px 16px', 
                fontSize: '11px', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>Tìm kiếm gần đây</span>
                <button
                  onClick={clearAllRecent}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Xóa tất cả
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="recent-search-item"
                  onClick={() => handleSearch(search)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <i className="bx bx-time" style={{ color: 'var(--text-muted)', fontSize: 16 }}></i>
                  <span style={{ 
                    flex: 1, 
                    fontSize: '13px', 
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {search}
                  </span>
                  <button
                    onClick={(e) => clearRecentSearch(search, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: 16,
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
