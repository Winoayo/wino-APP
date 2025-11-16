import React from 'react';
import { Block } from '../types';
import { ChainIcon, HashIcon, HeartIcon } from './Icons';

interface BlockCardProps {
  block: Block;
  onLike: (blockHash: string) => void;
}

const PostContent: React.FC<{ post: Block['post'] }> = ({ post }) => {
  switch (post.type) {
    case 'audio':
      return <audio controls src={post.content} className="w-full mt-2" />;
    case 'video':
      return <video controls src={post.content} className="w-full rounded-md mt-2 max-h-96" />;
    case 'text':
    default:
      return <p className="text-gray-200 my-4 text-lg whitespace-pre-wrap">{post.content}</p>;
  }
};

const BlockCard: React.FC<BlockCardProps> = ({ block, onLike }) => {
  const isGenesis = block.index === 0;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-xl text-cyan-300">{block.post.author}</p>
            <p className="text-sm text-gray-400">{new Date(block.timestamp).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className={`text-xs font-mono px-2 py-1 rounded ${isGenesis ? 'bg-purple-600 text-purple-100' : 'bg-gray-700 text-gray-300'}`}>
              Block #{block.index}
            </span>
          </div>
        </div>
        <PostContent post={block.post} />
      </div>
      <div className="bg-gray-800/50 px-5 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
             <div className="flex items-center text-xs text-gray-400 mb-2">
                <HashIcon className="w-4 h-4 mr-2 text-cyan-500 flex-shrink-0" />
                <span className="font-semibold mr-2">Hash:</span>
                <span className="font-mono truncate">{block.hash}</span>
            </div>
            <div className="flex items-center text-xs text-gray-400">
                <ChainIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <span className="font-semibold mr-2">Prev Hash:</span>
                <span className="font-mono truncate">{block.previousHash}</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
             <button 
               onClick={() => onLike(block.hash)} 
               className="flex items-center space-x-2 text-gray-400 hover:text-pink-400 transition-colors duration-200 px-3 py-1 rounded-full bg-gray-700/50 hover:bg-gray-700"
               aria-label={`Like post by ${block.post.author}`}
              >
              <HeartIcon className={`w-5 h-5 ${(block.likes || 0) > 0 ? 'text-pink-500 fill-current' : ''}`} />
              <span className="font-semibold text-sm">{block.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockCard;