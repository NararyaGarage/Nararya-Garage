import React, { ReactNode } from 'react';

interface MessageItemProps {
  avatar: ReactNode;
  username: string;
  timestamp: string;
  content: ReactNode;
  isBotMessage?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ avatar, username, timestamp, content, isBotMessage = false }) => {
  return (
    <div className="flex">
      <div className="flex-shrink-0 mr-4">
        {avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <div className="flex space-x-1">
            <span className="font-semibold text-white">{username}</span>
            {isBotMessage && (
              <span className="bg-[hsl(var(--discord-blue))] text-white text-xs px-1 rounded">BOT</span>
            )}
          </div>
          <span className="text-[hsl(var(--discord-muted))] text-xs ml-2">{timestamp}</span>
        </div>
        <div className="mt-1">
          {content}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
