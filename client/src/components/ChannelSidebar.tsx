import React from 'react';
import { FaChevronDown, FaHashtag, FaMicrophone, FaHeadphones, FaGear } from 'react-icons/fa6';

const ChannelCategory: React.FC<{ name: string; channels: string[] }> = ({ name, channels }) => {
  return (
    <div className="pt-4">
      <div className="px-4 text-xs font-semibold text-[hsl(var(--discord-muted))] flex items-center hover:text-white cursor-pointer">
        <FaChevronDown className="mr-1 text-[10px]" />
        <span>{name}</span>
      </div>
      <div className="mt-1">
        {channels.map((channel, index) => (
          <div 
            key={index} 
            className={`px-2 mx-2 ${channel === 'jkt48' ? 'text-white bg-gray-700' : 'text-[hsl(var(--discord-muted))]'} py-1 text-sm rounded flex items-center hover:bg-gray-700 hover:text-white cursor-pointer`}
          >
            <span className="text-lg mr-1">#</span> {channel}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChannelSidebar: React.FC = () => {
  const categories = [
    {
      name: 'JKT48 NOTIFICATIONS',
      channels: ['livestreams', 'theater-schedules', 'events']
    },
    {
      name: '48GROUP NOTIFICATIONS',
      channels: ['akb48', 'ske48', 'nmb48', 'jkt48']
    },
    {
      name: 'BOT COMMANDS',
      channels: ['command-center', 'music-player', 'member-info', 'media-tools', 'tickets']
    }
  ];

  return (
    <div className="w-60 bg-[hsl(var(--discord-darker))] flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center">
        <h2 className="font-bold text-white">JKT48 Community</h2>
        <FaChevronDown className="ml-auto text-gray-400 text-xs" />
      </div>
      
      <div className="overflow-y-auto flex-1">
        {categories.map((category, index) => (
          <ChannelCategory 
            key={index} 
            name={category.name} 
            channels={category.channels} 
          />
        ))}
      </div>
      
      <div className="p-2 bg-[hsl(var(--discord-sidebar))] flex items-center">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--discord-blue))] flex items-center justify-center">
          <span className="text-white text-xs">ME</span>
        </div>
        <div className="ml-2">
          <div className="text-sm font-semibold text-white">User123</div>
          <div className="text-xs text-[hsl(var(--discord-muted))]">#1234</div>
        </div>
        <div className="ml-auto flex space-x-2 text-gray-400">
          <FaMicrophone />
          <FaHeadphones />
          <FaGear />
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;
