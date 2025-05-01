import React, { useState } from 'react';
import { FaHashtag, FaBellSlash, FaThumbtack, FaUserGroup, FaMagnifyingGlass, FaInbox, FaCircleQuestion, FaPlus, FaRegFaceSmile, FaGift, FaImage } from 'react-icons/fa6';
import WelcomeMessage from '../bot/WelcomeMessage';
import StatusMessage from '../bot/StatusMessage';
import TheaterSchedule from '../bot/TheaterSchedule';
import LivestreamAlert from '../bot/LivestreamAlert';
import UserMessage from './UserMessage';
import MemberInfo from '../bot/MemberInfo';
import TicketSystem from '../bot/TicketSystem';
import MusicPlayer from '../bot/MusicPlayer';
import { useQuery } from '@tanstack/react-query';

const MainContent: React.FC = () => {
  const [message, setMessage] = useState('');

  // Fetch initial data
  const { data: statusMessages } = useQuery({
    queryKey: ['/api/status-messages'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: member } = useQuery({
    queryKey: ['/api/members/search/Shani'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: theaterShow } = useQuery({
    queryKey: ['/api/theater-shows/1'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: livestream } = useQuery({
    queryKey: ['/api/livestreams/1'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: musicTrack } = useQuery({
    queryKey: ['/api/music-tracks/1'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel header */}
      <div className="h-12 border-b border-gray-800 flex items-center px-4">
        <FaHashtag className="text-[hsl(var(--discord-muted))] mr-2" />
        <h3 className="font-bold">jkt48</h3>
        <div className="ml-2 text-[hsl(var(--discord-muted))] text-sm">JKT48 official updates and notifications</div>
        <div className="ml-auto flex space-x-4 text-[hsl(var(--discord-muted))]">
          <FaBellSlash className="cursor-pointer hover:text-white" />
          <FaThumbtack className="cursor-pointer hover:text-white" />
          <FaUserGroup className="cursor-pointer hover:text-white" />
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-[hsl(var(--discord-sidebar))] text-[hsl(var(--discord-muted))] px-2 py-1 text-sm rounded-md w-40" 
            />
            <FaMagnifyingGlass className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs" />
          </div>
          <FaInbox className="cursor-pointer hover:text-white" />
          <FaCircleQuestion className="cursor-pointer hover:text-white" />
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <WelcomeMessage />
        
        {statusMessages && statusMessages.length > 0 && (
          <StatusMessage status={statusMessages[0]} />
        )}
        
        {theaterShow && (
          <TheaterSchedule show={theaterShow} />
        )}
        
        {livestream && (
          <LivestreamAlert livestream={livestream} />
        )}
        
        <UserMessage 
          user={{ username: 'User123', avatarColor: 'bg-[hsl(var(--discord-blue))]', avatarText: 'ME' }}
          message="/member info Shani"
          timestamp="Today at 1:05 PM"
        />
        
        {member && (
          <MemberInfo member={member} />
        )}
        
        <TicketSystem />
        
        {musicTrack && (
          <MusicPlayer track={musicTrack} />
        )}
      </div>
      
      {/* Message input area */}
      <div className="p-4 bg-[hsl(var(--discord-darker))]">
        <div className="flex mb-1 text-xs text-[hsl(var(--discord-muted))] px-4">
          <div>Sending message to <span className="text-white">#jkt48</span></div>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--discord-muted))]">
            <FaPlus />
          </div>
          <input 
            type="text" 
            placeholder="Message #jkt48" 
            className="w-full bg-[hsl(var(--discord-sidebar))] text-[hsl(var(--discord-text))] rounded-lg py-2 px-10 focus:outline-none"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && message.trim()) {
                // Handle sending message
                setMessage('');
              }
            }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-3 text-[hsl(var(--discord-muted))]">
            <FaRegFaceSmile className="cursor-pointer hover:text-white" />
            <FaGift className="cursor-pointer hover:text-white" />
            <FaImage className="cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
