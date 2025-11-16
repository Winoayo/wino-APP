
import { Block, Post } from '../types';

// This is a mock remote chain. In a real P2P network, this would come from another peer.
const mockGlobalChain: Block[] = [
  {
    index: 0,
    timestamp: 1672531200000,
    // FIX: Added missing 'type' property to the Post object to conform to the Post type definition.
    post: { author: 'Genesis', content: 'The first post on the chain.', type: 'text' },
    previousHash: '0',
    hash: '000ab57945e484b391307b9a527c9172f3a61f5c63595460515152865668605c',
    nonce: 839
  },
  {
    index: 1,
    timestamp: 1672531260000,
    // FIX: Added missing 'type' property to the Post object to conform to the Post type definition.
    post: { author: 'Alice', content: 'Hello from the global network!', type: 'text' },
    previousHash: '000ab57945e484b391307b9a527c9172f3a61f5c63595460515152865668605c',
    hash: '000f7e4f454a7d65f577f8d68d18408a2a893c5c2d3388c340a69a2d21a9a838',
    nonce: 1475
  },
  {
    index: 2,
    timestamp: 1672531320000,
    // FIX: Added missing 'type' property to the Post object to conform to the Post type definition.
    post: { author: 'Bob', content: 'Offline-first is the future.', type: 'text' },
    previousHash: '000f7e4f454a7d65f577f8d68d18408a2a893c5c2d3388c340a69a2d21a9a838',
    hash: '0001cc4c424a1801570773b064975765c40465d6c8e31885f67b55f1f94c9f13',
    nonce: 5122
  }
];

// Simulates fetching the chain from a peer with a delay.
export const fetchRemoteBlocks = (): Promise<Block[]> => {
  console.log('Fetching blocks from simulated peer...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Received blocks from peer.');
      resolve(mockGlobalChain);
    }, 1500); // Simulate network latency
  });
};