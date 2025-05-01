import React from 'react';
import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import MainContent from './MainContent';
import MembersSidebar from './MembersSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const DiscordLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-[hsl(var(--discord-dark))] text-white overflow-hidden">
      <ServerSidebar />
      <ChannelSidebar />
      <MainContent />
      {!isMobile && <MembersSidebar />}
    </div>
  );
};

export default DiscordLayout;
