import React, { ReactNode } from 'react';
import MessageItem from './MessageItem';

interface BotMessageProps {
  content: ReactNode;
  timestamp?: string;
  alertTitle?: string;
}

const BotAvatar: React.FC = () => (
  <div className="w-10 h-10 rounded-full bg-[hsl(var(--jkt-orange))] flex items-center justify-center">
    <span className="text-white font-bold text-xs">JKT</span>
  </div>
);

const BotMessage: React.FC<BotMessageProps> = ({ content, timestamp = 'Today at 9:30 AM', alertTitle }) => {
  return (
    <MessageItem
      avatar={<BotAvatar />}
      username="JKT48 Bot"
      timestamp={timestamp}
      content={
        <>
          {alertTitle && (
            <div className="text-white">
              <span className="font-bold">{alertTitle}</span>
            </div>
          )}
          {content}
        </>
      }
      isBotMessage={true}
    />
  );
};

export default BotMessage;
