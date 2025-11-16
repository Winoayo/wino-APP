import React from 'react';
import { Block } from '../types';
import BlockCard from './BlockCard';

interface FeedProps {
  chain: Block[];
  onLike: (blockHash: string) => void;
}

const Feed: React.FC<FeedProps> = ({ chain, onLike }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Decentralized Feed</h2>
       {chain.length > 0 ? (
        <div className="space-y-4">
          {chain.slice().reverse().map((block) => (
            <BlockCard key={block.hash} block={block} onLike={onLike} />
          ))}
        </div>
      ) : (
         <div className="text-center py-10 bg-gray-800 rounded-lg">
           <p className="text-gray-400">The blockchain is empty. Create the first post!</p>
         </div>
      )}
    </div>
  );
};

export default Feed;