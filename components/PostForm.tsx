import React, { useState, useRef, useCallback } from 'react';
import { Post, PostType } from '../types';
import { MineIcon, TextIcon, VideoIcon, AudioIcon, RecordIcon } from './Icons';

interface PostFormProps {
  onSubmit: (post: Post) => Promise<void>;
  miningStatus: boolean;
  difficulty: number;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const PostForm: React.FC<PostFormProps> = ({ onSubmit, miningStatus, difficulty }) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [postType, setPostType] = useState<PostType>('text');
  const [media, setMedia] = useState<{ url: string; name: string; type: PostType, size: number } | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const resetForm = () => {
    setAuthor('');
    setContent('');
    setMedia(null);
    setError('');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const type = file.type.startsWith('audio') ? 'audio' : 'video';
      setMedia({ url, name: file.name, type, size: file.size });
      setPostType(type);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    }
    reader.readAsDataURL(file);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setIsRecording(true);
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not start recording. Check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    (videoPreviewRef.current?.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
    setIsRecording(false);

    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    
    if (blob.size > MAX_FILE_SIZE_BYTES) {
      setError(`Recording exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      setMedia(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setMedia({ url, name: `recording-${Date.now()}.webm`, type: 'video', size: blob.size });
    };
    reader.readAsDataURL(blob);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setError('Author name cannot be empty.');
      return;
    }

    let post: Post;

    if (postType === 'text') {
      if (!content.trim()) {
        setError('Content cannot be empty.');
        return;
      }
      post = { author, content, type: 'text' };
    } else {
      if (!media) {
        setError('Please select or record a media file.');
        return;
      }
      post = { 
        author, 
        content: media.url, 
        type: media.type,
        mediaInfo: { name: media.name, size: media.size }
      };
    }
    
    setError('');
    onSubmit(post).then(resetForm);
  };

  const renderFormContent = () => {
    switch (postType) {
      case 'audio':
      case 'video':
        return (
          <div>
            <label htmlFor="media-upload" className="block text-gray-300 mb-2">Upload Audio/Video</label>
            <input id="media-upload" type="file" accept="audio/*,video/*" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700" disabled={miningStatus} />
            <p className="text-xs text-gray-500 mt-1">Max file size: {MAX_FILE_SIZE_MB}MB</p>
            {media?.type === 'audio' && media.url && <audio controls src={media.url} className="w-full mt-4" />}
            {media?.type === 'video' && media.url && <video controls src={media.url} className="w-full mt-4 rounded-md" />}
          </div>
        );
      case 'text':
      default:
        return (
          <div>
            <label htmlFor="content" className="block text-gray-300 mb-2">Content</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" rows={4} placeholder="What's on your mind?" disabled={miningStatus}/>
          </div>
        );
    }
  };

  const TabButton = ({ type, icon, label }: {type: PostType | 'record', icon: React.ReactNode, label: string}) => {
      const isActive = type === 'record' ? postType === 'video' && media?.name.startsWith('recording-') : postType === type;
      const isSelected = postType === type;
      return (
        <button
          type="button"
          onClick={() => {
            setPostType(type === 'record' ? 'video' : type);
            setContent('');
            setMedia(null);
            setError('');
          }}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isSelected ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          disabled={miningStatus}
        >
          {icon}
          <span>{label}</span>
        </button>
      )
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Create a New Post</h2>
      <p className="text-gray-400 mb-4 text-sm">
        Your post will be cryptographically secured by "mining" it into a new block. (Difficulty: {difficulty})
      </p>
      
      <div className="flex space-x-2 mb-4 border-b border-gray-700 pb-4">
        <TabButton type="text" icon={<TextIcon className="w-5 h-5"/>} label="Text" />
        <TabButton type="audio" icon={<AudioIcon className="w-5 h-5"/>} label="Audio" />
        <TabButton type="video" icon={<VideoIcon className="w-5 h-5"/>} label="Video" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="author" className="block text-gray-300 mb-2">Author</label>
          <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your name" disabled={miningStatus} />
        </div>
        
        <div className="mb-4">
            {renderFormContent()}
        </div>

        <div className="mb-4 bg-gray-900/50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Or Record a Video Clip</h3>
            <video ref={videoPreviewRef} muted className={`w-full rounded-md bg-black ${isRecording || (media?.type === 'video' && media?.name.startsWith('recording-')) ? 'block' : 'hidden'}`} />
            {isRecording ? (
                <button type="button" onClick={stopRecording} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">
                    <RecordIcon className="w-5 h-5 mr-2" /> Stop Recording
                </button>
            ) : (
                <button type="button" onClick={startRecording} className="w-full mt-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center" disabled={miningStatus}>
                    <VideoIcon className="w-5 h-5 mr-2" /> Start Recording
                </button>
            )}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={miningStatus}>
          {miningStatus ? (
            <>
              <MineIcon className="animate-spin w-5 h-5 mr-3" />
              Mining Block...
            </>
          ) : (
            'Add Post to Chain'
          )}
        </button>
      </form>
    </div>
  );
};

export default PostForm;