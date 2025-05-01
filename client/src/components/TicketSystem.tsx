import React from 'react';
import BotMessage from '../discord/BotMessage';
import { Button } from '@/components/ui/button';
import { FaTicketAlt, FaQuestionCircle, FaCalendarCheck } from 'react-icons/fa';

const TicketSystem: React.FC = () => {
  return (
    <BotMessage
      timestamp="Today at 1:15 PM"
      alertTitle="🎟️ TICKETING SYSTEM"
      content={
        <div className="mt-1 border-l-4 border-purple-600 rounded bg-[hsl(var(--discord-darker))] p-4">
          <div className="font-bold text-white text-lg">Create a Support Ticket</div>
          <div className="mt-2 text-[hsl(var(--discord-text))] text-sm">
            Need help with something? Create a ticket and our team will assist you!
          </div>
          <div className="mt-4 space-y-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 flex items-center justify-center"
            >
              <FaTicketAlt className="mr-2" /> General Support
            </Button>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 flex items-center justify-center"
            >
              <FaQuestionCircle className="mr-2" /> Bot Help
            </Button>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 flex items-center justify-center"
            >
              <FaCalendarCheck className="mr-2" /> Event Request
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default TicketSystem;
