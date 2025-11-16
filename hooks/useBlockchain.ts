
import { useState, useEffect, useCallback } from 'react';
import { Block, Post, SyncStatus } from '../types';
import { sha256 } from '../services/cryptoService';
import { fetchRemoteBlocks } from '../services/networkService';

const CHAIN_STORAGE_KEY = 'p2p_social_feed_chain';
const DIFFICULTY = 3;

// --- Core Blockchain Logic ---

const createGenesisBlock = async (): Promise<Block> => {
  // FIX: Added missing 'type' property to the Post object to conform to the Post type definition.
  const post: Post = { author: 'Genesis', content: 'The first post on the chain.', type: 'text' };
  const partialBlock = {
    index: 0,
    timestamp: Date.now(),
    post,
    previousHash: '0',
    nonce: 0,
    likes: 0,
  };
  const hash = await sha256(JSON.stringify(partialBlock));
  const block = { ...partialBlock, hash, nonce: 0, likes: 0 };
  
  // No need to mine genesis, but for consistency we can give it a valid hash structure
  return await mineBlock(block, 0);
};

const calculateHashForBlock = async (block: Omit<Block, 'hash'>): Promise<string> => {
    const blockData = {
        index: block.index,
        timestamp: block.timestamp,
        post: block.post,
        previousHash: block.previousHash,
        nonce: block.nonce
        // Likes are not part of the hash to allow changes without re-mining
    };
    return sha256(JSON.stringify(blockData));
};

const mineBlock = async (block: Omit<Block, 'hash'>, difficulty: number): Promise<Block> => {
    let newBlock = { ...block };
    let hash = await calculateHashForBlock(newBlock);
    const prefix = '0'.repeat(difficulty);

    while (hash.substring(0, difficulty) !== prefix) {
        newBlock.nonce++;
        // FIX: Corrected function name from calculateHashFor_Block to calculateHashForBlock
        hash = await calculateHashForBlock(newBlock);
    }
    return { ...newBlock, hash };
};

const isChainValid = async (chain: Block[]): Promise<boolean> => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // Recalculate hash based on stored data (excluding likes)
    const currentBlockHash = await calculateHashForBlock(currentBlock);

    if (currentBlock.hash !== currentBlockHash) {
      console.error(`Block ${currentBlock.index} hash is invalid.`);
      return false;
    }

    if (currentBlock.previousHash !== previousBlock.hash) {
      console.error(`Chain broken at Block ${currentBlock.index}.`);
      return false;
    }
  }
  return true;
};


// --- React Hook ---

export const useBlockchain = () => {
  const [chain, setChain] = useState<Block[]>([]);
  const [status, setStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    const initializeChain = async () => {
      try {
        const storedChain = localStorage.getItem(CHAIN_STORAGE_KEY);
        if (storedChain) {
          const parsedChain = JSON.parse(storedChain);
          if (await isChainValid(parsedChain)) {
            setChain(parsedChain.map(b => ({ ...b, likes: b.likes || 0 })));
          } else {
            console.warn('Stored chain is invalid. Creating new genesis block.');
            const genesis = await createGenesisBlock();
            setChain([genesis]);
          }
        } else {
          const genesis = await createGenesisBlock();
          setChain([genesis]);
        }
      } catch (error) {
        console.error('Failed to initialize blockchain:', error);
        const genesis = await createGenesisBlock();
        setChain([genesis]);
      }
    };

    initializeChain();
  }, []);

  useEffect(() => {
    if (chain.length > 0) {
      localStorage.setItem(CHAIN_STORAGE_KEY, JSON.stringify(chain));
    }
  }, [chain]);

  const addPost = useCallback(async (post: Post) => {
    if (chain.length === 0) return;
    setStatus('mining');
    try {
      const latestBlock = chain[chain.length - 1];
      const newBlockData: Omit<Block, 'hash'> = {
        index: latestBlock.index + 1,
        timestamp: Date.now(),
        post,
        previousHash: latestBlock.hash,
        nonce: 0,
        likes: 0,
      };
      
      const newBlock = await mineBlock(newBlockData, DIFFICULTY);

      setChain(prevChain => [...prevChain, newBlock]);
      setStatus('idle');
    } catch (error) {
      console.error("Failed to mine new block:", error);
      setStatus('error');
    }
  }, [chain]);
  
  const addLike = useCallback((blockHash: string) => {
    setChain(prevChain => 
      prevChain.map(block => 
        block.hash === blockHash 
          ? { ...block, likes: (block.likes || 0) + 1 } 
          : block
      )
    );
  }, []);

  const syncChain = useCallback(async () => {
    if (status === 'syncing') return;
    setStatus('syncing');
    try {
        const remoteChain = await fetchRemoteBlocks();
        const localChainIsValid = await isChainValid(chain);
        const remoteChainIsValid = await isChainValid(remoteChain);

        if (remoteChainIsValid && remoteChain.length > chain.length) {
            console.log("Remote chain is longer and valid. Syncing...");
            // Merge likes from local chain to remote chain if blocks match
            const syncedChain = remoteChain.map(remoteBlock => {
                const localBlock = chain.find(b => b.hash === remoteBlock.hash);
                return localBlock ? { ...remoteBlock, likes: localBlock.likes || 0 } : remoteBlock;
            });
            setChain(syncedChain);
        } else if (!localChainIsValid && remoteChainIsValid) {
            console.log("Local chain is invalid. Replacing with valid remote chain.");
            setChain(remoteChain);
        } else {
            console.log("Local chain is up-to-date or remote is invalid/shorter.");
        }
        setStatus('synced');
        setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
        console.error("Failed to sync with network:", error);
        setStatus('error');
    }
  }, [chain, status]);

  return { chain, addPost, addLike, syncChain, status, difficulty: DIFFICULTY };
};