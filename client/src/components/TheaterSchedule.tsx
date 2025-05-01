import React from 'react';
import BotMessage from '../discord/BotMessage';
import { Button } from '@/components/ui/button';
import { FaCalendar, FaTicket } from 'react-icons/fa6';
import { TheaterShow } from '@shared/types';

interface TheaterScheduleProps {
  show: TheaterShow;
}

const TheaterSchedule: React.FC<TheaterScheduleProps> = ({ show }) => {
  return (
    <BotMessage
      timestamp="Today at 11:30 AM"
      alertTitle="📢 THEATER SCHEDULE NOTIFICATION"
      content={
        <div className="mt-1 border-l-4 border-[hsl(var(--jkt-orange))] rounded bg-[hsl(var(--discord-darker))] p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-lg">{show.title}</span>
            <span className="bg-[hsl(var(--discord-blue))] text-white text-xs px-2 py-1 rounded-full">30 MIN REMINDER</span>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[hsl(var(--discord-muted))] text-xs">DATE & TIME</div>
              <div className="text-white">{show.date}, {show.time}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--discord-muted))] text-xs">LOCATION</div>
              <div className="text-white">{show.location}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--discord-muted))] text-xs">SETLIST</div>
              <div className="text-white">{show.setlist}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--discord-muted))] text-xs">MEMBERS</div>
              <div className="text-white">{show.members}</div>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              className="bg-[hsl(var(--jkt-orange))] hover:bg-[hsl(var(--jkt-light-orange))] text-white text-sm px-4 py-2 flex items-center"
            >
              <FaCalendar className="mr-2" /> Add to Calendar
            </Button>
            <Button
              className="bg-[hsl(var(--discord-blue))] hover:opacity-80 text-white text-sm px-4 py-2 flex items-center"
            >
              <FaTicket className="mr-2" /> Ticket Info
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default TheaterSchedule;
