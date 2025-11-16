export type PostType = 'text' | 'audio' | 'video';

export interface Post {
  author: string;
  content: string; // Text message OR base64 data URL for media
  type: PostType;
  mediaInfo?: {
    name?: string;
    size?: number; // in bytes
  }
}

export interface Block {
  index: number;
  timestamp: number;
  post: Post;
  previousHash: string;
  hash: string;
  nonce: number;
  likes?: number;
}

export type SyncStatus = 'idle' | 'mining' | 'synced' | 'error' | 'syncing';