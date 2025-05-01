import React from 'react';
import BotMessage from '../discord/BotMessage';
import { Button } from '@/components/ui/button';
import { FaVideo, FaBell, FaPlay } from 'react-icons/fa6';
import { Livestream } from '@shared/types';

interface LivestreamAlertProps {
  livestream: Livestream;
}

const LivestreamAlert: React.FC<LivestreamAlertProps> = ({ livestream }) => {
  return (
    <BotMessage
      timestamp="Today at 12:45 PM"
      alertTitle="🔴 LIVESTREAM ALERT"
      content={
        <div className="mt-1 border-l-4 border-[hsl(var(--discord-red))] rounded bg-[hsl(var(--discord-darker))] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-lg">{livestream.title}</span>
            <span className="bg-[hsl(var(--discord-red))] text-white text-xs px-2 py-1 rounded-full animate-pulse">LIVE NOW</span>
          </div>
          <div className="mt-2 rounded overflow-hidden relative h-40 bg-gray-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button className="bg-[hsl(var(--discord-red))] text-white rounded-full w-14 h-14 flex items-center justify-center">
                  <FaPlay className="text-2xl" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              className="bg-[hsl(var(--discord-red))] hover:opacity-80 text-white text-sm px-4 py-2 flex items-center"
              onClick={() => window.open(livestream.streamUrl, '_blank')}
            >
              <FaVideo className="mr-2" /> Watch Stream
            </Button>
            <Button
              variant="outline"
              className="bg-[hsl(var(--discord-darker))] border border-gray-600 text-white text-sm px-4 py-2 flex items-center hover:bg-gray-700"
            >
              <FaBell className="mr-2" /> Notify Me
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default LivestreamAlert;
