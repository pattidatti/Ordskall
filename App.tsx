import React, { useState, useEffect, useCallback } from 'react';
import { generateRandomWord, generateWordImage, generateSpecificWord } from './services/geminiService';
import { WordData } from './types';
import { InflectionTable } from './components/InflectionTable';
import { LoadingState } from './components/LoadingState';

// Helper component to render formatted etymology text
const EtymologyRenderer: React.FC<{ text: string }> = ({ text }) => {
  // Split by newlines to separate paragraphs and list items
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="text-stone-800 leading-8 text-lg font-serif">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        // Check if the line is a list item (starts with -, •, or *)
        const isListItem = /^[-\u2022*]/.test(trimmed);

        if (isListItem) {
          // Remove the bullet character and whitespace
          const content = trimmed.replace(/^[-\u2022*]\s*/, '');
          return (
            <div key={index} className="flex items-start gap-3 ml-2 mb-2 pl-4 border-l-2 border-emerald-100/50 hover:border-emerald-200 transition-colors">
              <span className="text-emerald-700 mt-2.5 text-[0.5rem] flex-shrink-0">●</span>
              <span className="flex-1">{content}</span>
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <p key={index} className="mb-4 last:mb-0">
            {line}
          </p>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<WordData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setImageUrl(null);
    setImageLoading(false);

    try {
      let wordData: WordData;
      
      // 1. Fetch text data (Random or Specific)
      if (query && query.trim().length > 0) {
        wordData = await generateSpecificWord(query);
      } else {
        wordData = await generateRandomWord();
      }
      
      setData(wordData);
      setLoading(false);

      // 2. Fetch image data based on the text result
      setImageLoading(true);
      const img = await generateWordImage(wordData.word, wordData.definition, wordData.etymology);
      setImageUrl(img);
    } catch (err) {
      console.error(err);
      setError("Fant ikke ordet eller noe gikk galt med AI-genereringen. Prøv igjen.");
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchData(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-stone-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => fetchData()}>
            <span className="text-2xl filter drop-shadow-sm">🌲</span>
            <h1 className="hidden sm:block text-xl font-serif font-bold tracking-tight text-stone-800">Ordskatt</h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søk etter et ord..."
              className="block w-full pl-10 pr-3 py-2.5 border border-stone-200 rounded-full leading-5 bg-stone-50 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
            />
          </form>

          {/* New Word Button */}
          <button
            onClick={() => { setSearchQuery(''); fetchData(); }}
            disabled={loading}
            className="flex-shrink-0 group flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-900/10 active:transform active:scale-95"
          >
            <span className={`block ${loading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
              ↻
            </span>
            <span className="hidden sm:inline">Nytt tilfeldig ord</span>
            <span className="sm:hidden">Nytt</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-start">
        
        {error && (
          <div className="max-w-md mx-auto mb-10 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-center shadow-sm">
            {error}
            <button 
              onClick={() => fetchData()} 
              className="block mx-auto mt-2 text-sm font-bold hover:underline"
            >
              Prøv på nytt
            </button>
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : data ? (
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-fade-in">
            
            {/* Left Column: Text Info */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              
              {/* Header Section */}
              <div className="border-b border-stone-200 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    {data.wordClass}
                  </span>
                </div>
                <h2 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold text-stone-900 mb-6 leading-none break-words tracking-tight">
                  {data.word}
                </h2>
                <p className="text-xl sm:text-2xl text-stone-600 font-light leading-relaxed max-w-2xl">
                  {data.definition}
                </p>
              </div>

              {/* Etymology Section - Cleaner Look with Renderer */}
              <div className="prose prose-stone prose-lg max-w-none">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
                  Opprinnelse
                </h3>
                <EtymologyRenderer text={data.etymology} />
              </div>

              {/* Extras Grid */}
              <div className="grid grid-cols-1 gap-6 pt-4">
                
                {/* Inflections */}
                <div>
                   <InflectionTable inflections={data.inflections} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                   {/* Usage Example */}
                   <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Eksempel</h3>
                      </div>
                      <p className="text-stone-800 text-lg italic leading-relaxed font-serif">"{data.usageExample}"</p>
                   </div>
                   
                   {/* Fun Fact */}
                   {data.funFact && (
                     <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-amber-500 text-lg">💡</span>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800/60">Visste du?</h3>
                        </div>
                        <p className="text-amber-900/80 leading-relaxed">{data.funFact}</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-stone-100 relative group border border-stone-100 shadow-2xl shadow-stone-200/50">
                {imageLoading && !imageUrl ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 gap-4 bg-stone-50">
                    <div className="w-12 h-12 border-4 border-stone-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium animate-pulse text-stone-400 uppercase tracking-widest text-xs">Skisserer...</p>
                  </div>
                ) : imageUrl ? (
                  <>
                    <img 
                      src={imageUrl} 
                      alt={`Illustrasjon av ordet ${data.word}`} 
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white/90 text-xs font-medium text-center uppercase tracking-widest backdrop-blur-sm py-1 px-3 rounded-full bg-white/10 inline-block mx-auto">AI-tolkning</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
};

export default App;