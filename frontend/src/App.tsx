import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, Youtube, Play, Loader2, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:8000';

interface SearchResult {
  start: number;
  end: number;
  text: string;
  score: number;
}

function App() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const [currentTime, setCurrentTime] = useState(0);

  const extractVideoId = (link: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(url);
    if (!id) {
      alert("Invalid YouTube URL");
      return;
    }
    setVideoId(id);
    setIsProcessing(true);
    try {
      await axios.post(`${API_URL}/process_youtube`, { video_id: id });
      setIsProcessed(true);
    } catch (error) {
      console.error(error);
      alert("Failed to process video");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !isProcessed) return;

    setIsSearching(true);
    try {
      const res = await axios.post(`${API_URL}/search`, { video_id: videoId, query });
      setResults(res.data.results);
      if (res.data.results.length > 0) {
        setCurrentTime(res.data.results[0].start);
      }
    } catch (error) {
      console.error(error);
      alert("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Video Semantic Search
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Find exactly what you're looking for inside any YouTube video using AI-powered natural language search.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input & Video */}
          <div className="space-y-6">
            
            {/* URL Input Form */}
            <form onSubmit={handleProcess} className="glass-card p-6 space-y-4 shadow-xl">
              <label className="block text-sm font-medium text-slate-300">
                YouTube Video URL
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200 shadow-inner"
                    disabled={isProcessing}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isProcessing || !url}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Process'}
                </button>
              </div>
              
              {isProcessed && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Video analyzed and ready for search</span>
                </div>
              )}
            </form>

            {/* Video Player */}
            {videoId && (
              <div className="glass-card p-4 overflow-hidden shadow-xl animate-in fade-in zoom-in-95">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?start=${Math.floor(currentTime)}&autoplay=${currentTime > 0 ? 1 : 0}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Search & Results */}
          <div className="space-y-6">
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className={`glass-card p-6 space-y-4 shadow-xl transition-opacity duration-300 ${!isProcessed ? 'opacity-50 pointer-events-none' : ''}`}>
               <label className="block text-sm font-medium text-slate-300">
                Search within video
              </label>
              <div className="relative flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 'explain transformer architecture'"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-200 shadow-inner"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching || !query}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Search'}
                </button>
              </div>
            </form>

            {/* Results */}
            {results.length > 0 && (
              <div className="glass-card p-6 space-y-4 shadow-xl animate-in slide-in-from-bottom-4">
                <h3 className="font-semibold text-lg text-slate-200 flex items-center gap-2">
                  <Play className="w-5 h-5 text-indigo-400" />
                  Relevant segments
                </h3>
                <div className="space-y-3">
                  {results.map((res, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentTime(res.start)}
                      className="w-full text-left p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/50 hover:border-indigo-500/50 transition-all group flex gap-4 items-start shadow-sm"
                    >
                      <div className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded text-sm font-mono mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-500/20 group-hover:border-transparent">
                        {formatTime(res.start)}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300 leading-relaxed text-sm">
                          "{res.text}"
                        </p>
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                          Confidence match: {(res.score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {results.length === 0 && isProcessed && query && !isSearching && (
               <div className="glass-card p-8 text-center text-slate-400 animate-in fade-in">
                 No relevant segments found. Try rephrasing your search!
               </div>
            )}
            
            {!isProcessed && (
              <div className="glass-card p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px] border-dashed border-slate-700 border-2 bg-transparent">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Youtube className="w-8 h-8 text-slate-600" />
                </div>
                <p className="font-medium text-slate-400">Process a video first</p>
                <p className="text-sm mt-1">to unlock semantic search capabilities.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
