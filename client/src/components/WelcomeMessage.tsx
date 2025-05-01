import React from 'react';
import BotMessage from '../discord/BotMessage';
import { Button } from '@/components/ui/button';
import { FaInfo } from 'react-icons/fa';

const WelcomeMessage: React.FC = () => {
  return (
    <BotMessage
      content={
        <>
          <div className="text-white">
            Welcome to the JKT48 Discord server! I'll help you stay updated with all JKT48 activities.
          </div>
          <div className="mt-4 border-l-4 border-[hsl(var(--jkt-orange))] rounded bg-[hsl(var(--discord-darker))] p-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-[hsl(var(--jkt-orange))] rounded-full flex items-center justify-center mr-2">
                <FaInfo className="text-white text-xs" />
              </div>
              <span className="font-bold text-white">Getting Started</span>
            </div>
            <div className="mt-2 text-[hsl(var(--discord-text))] text-sm">
              Use <span className="bg-[hsl(var(--discord-sidebar))] rounded px-1 text-xs">/help</span> to see all available commands.<br />
              Use <span className="bg-[hsl(var(--discord-sidebar))] rounded px-1 text-xs">/member</span> to get information about JKT48 members.<br />
              Use <span className="bg-[hsl(var(--discord-sidebar))] rounded px-1 text-xs">/schedule</span> to see upcoming theater shows and events.
            </div>
            <div className="mt-3 flex space-x-2">
              <Button
                className="bg-[hsl(var(--jkt-orange))] hover:bg-[hsl(var(--jkt-light-orange))] text-white text-sm px-4 py-1"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                className="bg-[hsl(var(--discord-darker))] border border-gray-600 text-white text-sm px-4 py-1 hover:bg-gray-700"
              >
                Set Notifications
              </Button>
            </div>
          </div>
        </>
      }
    />
  );
};

export default WelcomeMessage;
