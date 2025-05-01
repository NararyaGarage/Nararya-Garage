import React, { useEffect, useState } from 'react';
import BotMessage from '../discord/BotMessage';
import { useQuery } from '@tanstack/react-query';
import { StatusMessage as StatusMessageType } from '@shared/types';

interface StatusMessageProps {
  status: StatusMessageType;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status: initialStatus }) => {
  const [currentStatus, setCurrentStatus] = useState<StatusMessageType>(initialStatus);
  
  const { data: statusMessages } = useQuery({
    queryKey: ['/api/status-messages'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  useEffect(() => {
    if (!statusMessages) return;
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % statusMessages.length;
      setCurrentStatus(statusMessages[currentIndex]);
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [statusMessages]);
  
  const getStatusText = () => {
    if (!currentStatus) return 'ONLINE: Watching JKT48 MV';
    return `ONLINE: ${currentStatus.type === 'playing' ? 'Playing' : currentStatus.type === 'listening' ? 'Listening to' : 'Watching'} ${currentStatus.text}`;
  };

  return (
    <BotMessage
      timestamp="Today at 10:05 AM"
      content={
        <div className="mt-1 text-[hsl(var(--discord-text))]">
          <span className="text-[hsl(var(--discord-green))]">ONLINE:</span> {getStatusText().replace('ONLINE: ', '')}
        </div>
      }
    />
  );
};

export default StatusMessage;
