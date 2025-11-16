import React, { useState, useEffect } from 'react';
import { useBlockchain } from './hooks/useBlockchain';
import PostForm from './components/PostForm';
import Feed from './components/Feed';
import StatusIndicator from './components/StatusIndicator';
import { GithubIcon } from './components/Icons';

const App: React.FC = () => {
  const { chain, addPost, addLike, syncChain, status, difficulty } = useBlockchain();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncChain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">P2P Social Feed</h1>
            <p className="text-gray-400 mt-1">A simulated decentralized social network on a simple blockchain.</p>
          </div>
          <a href="https://github.com/google/genai-api-web-apps" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors">
            <GithubIcon className="w-8 h-8" />
          </a>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 lg:sticky top-8 self-start">
             <StatusIndicator status={status} isOnline={isOnline} syncAction={syncChain} blockCount={chain.length} />
            <PostForm onSubmit={addPost} miningStatus={status === 'mining'} difficulty={difficulty} />
          </div>

          <div className="lg:col-span-2">
            <Feed chain={chain} onLike={addLike} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;