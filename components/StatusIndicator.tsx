
import React from 'react';
import { SyncStatus } from '../types';
import { WifiIcon, WifiOffIcon, SyncIcon, CheckCircleIcon, CubeIcon, AlertTriangleIcon } from './Icons';

interface StatusIndicatorProps {
  status: SyncStatus;
  isOnline: boolean;
  syncAction: () => void;
  blockCount: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, isOnline, syncAction, blockCount }) => {
  const getStatusContent = () => {
    if (!isOnline) {
      return {
        icon: <WifiOffIcon className="w-5 h-5 text-red-400" />,
        text: "Offline",
        description: "Posts are saved locally.",
        bgColor: "bg-red-500/10",
        textColor: "text-red-400"
      };
    }
    switch (status) {
      case 'syncing':
        return {
          icon: <SyncIcon className="w-5 h-5 text-blue-400 animate-spin" />,
          text: "Syncing...",
          description: "Checking for new posts from peers.",
          bgColor: "bg-blue-500/10",
          textColor: "text-blue-400"
        };
      case 'synced':
        return {
          icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
          text: "Synced",
          description: "Your feed is up-to-date.",
          bgColor: "bg-green-500/10",
          textColor: "text-green-400"
        };
       case 'error':
        return {
          icon: <AlertTriangleIcon className="w-5 h-5 text-yellow-400" />,
          text: "Sync Error",
          description: "Could not sync with network.",
          bgColor: "bg-yellow-500/10",
          textColor: "text-yellow-400"
        };
      case 'idle':
      case 'mining':
      default:
        return {
          icon: <WifiIcon className="w-5 h-5 text-green-400" />,
          text: "Online",
          description: "Connected to the network.",
          bgColor: "bg-green-500/10",
          textColor: "text-green-400"
        };
    }
  };

  const { icon, text, description, bgColor, textColor } = getStatusContent();

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
      <div className={`flex items-center p-3 rounded-md mb-4 ${bgColor}`}>
        {icon}
        <div className="ml-3">
          <p className={`font-semibold ${textColor}`}>{text}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

       <div className="flex items-center text-gray-300 mb-4">
            <CubeIcon className="w-5 h-5 mr-3 text-cyan-400" />
            <span>Local Chain Length: <strong>{blockCount} Blocks</strong></span>
       </div>

      <button
        onClick={syncAction}
        disabled={!isOnline || status === 'syncing'}
        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-gray-600/50 disabled:cursor-not-allowed disabled:text-gray-500"
      >
        <SyncIcon className={`w-5 h-5 mr-2 ${status === 'syncing' ? 'animate-spin' : ''}`} />
        Force Network Sync
      </button>
    </div>
  );
};

export default StatusIndicator;
