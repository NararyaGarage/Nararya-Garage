import React, { useState } from 'react';
import BotMessage from '../discord/BotMessage';
import { FaBackwardStep, FaForwardStep, FaPause, FaPlay, FaShuffle, FaRepeat } from 'react-icons/fa6';
import { MusicTrack } from '@shared/types';

interface MusicPlayerProps {
  track: MusicTrack;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45); // 45% progress
  const [currentTime, setCurrentTime] = useState('1:30');

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <BotMessage
      timestamp="Today at 1:30 PM"
      alertTitle="🎵 NOW PLAYING"
      content={
        <div className="mt-1 border-l-4 border-[hsl(var(--jkt-orange))] rounded bg-[hsl(var(--discord-darker))] p-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded overflow-hidden bg-gray-700 flex items-center justify-center">
              {track.albumCover ? (
                <img src={track.albumCover} alt="Music cover" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm">JKT48</span>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="font-bold text-white">{track.title}</div>
              <div className="text-[hsl(var(--discord-muted))] text-sm">{track.artist}</div>
              <div className="mt-2 w-full bg-gray-700 h-1 rounded-full">
                <div 
                  className="bg-[hsl(var(--jkt-orange))] h-full rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-[hsl(var(--discord-muted))] mt-1">
                <span>{currentTime}</span>
                <span>{track.duration}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-center space-x-6">
            <button className="text-white hover:text-[hsl(var(--jkt-orange))]">
              <FaBackwardStep className="text-xl" />
            </button>
            <button 
              className="text-white hover:text-[hsl(var(--jkt-orange))]"
              onClick={togglePlayPause}
            >
              {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
            </button>
            <button className="text-white hover:text-[hsl(var(--jkt-orange))]">
              <FaForwardStep className="text-xl" />
            </button>
            <button className="text-white hover:text-[hsl(var(--jkt-orange))]">
              <FaShuffle className="text-xl" />
            </button>
            <button className="text-white hover:text-[hsl(var(--jkt-orange))]">
              <FaRepeat className="text-xl" />
            </button>
          </div>
          <div className="mt-3 text-xs text-center text-[hsl(var(--discord-muted))]">Queue: 3 songs · Total time: 10:45</div>
        </div>
      }
    />
  );
};

export default MusicPlayer;
