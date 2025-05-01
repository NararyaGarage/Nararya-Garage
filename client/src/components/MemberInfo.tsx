import React from 'react';
import BotMessage from '../discord/BotMessage';
import { Button } from '@/components/ui/button';
import { FaCalendarAlt, FaImages } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa6';
import { Member } from '@shared/types';

interface MemberInfoProps {
  member: Member;
}

const MemberInfo: React.FC<MemberInfoProps> = ({ member }) => {
  return (
    <BotMessage
      timestamp="Today at 1:05 PM"
      content={
        <div className="mt-1 border-l-4 border-[hsl(var(--jkt-orange))] rounded bg-[hsl(var(--discord-darker))] p-4">
          <div className="flex flex-col md:flex-row">
            <div className="w-24 h-24 rounded-full overflow-hidden mr-4 bg-gray-700 flex items-center justify-center">
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm">{member.nickname}</span>
              )}
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <div className="font-bold text-white text-xl flex items-center flex-wrap">
                {member.name}
                <span className="ml-2 bg-[hsl(var(--jkt-orange))] text-white text-xs px-2 py-0.5 rounded-full">
                  {member.team}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <div className="text-[hsl(var(--discord-muted))] text-xs">NICKNAME</div>
                  <div className="text-white">{member.nickname}</div>
                </div>
                <div>
                  <div className="text-[hsl(var(--discord-muted))] text-xs">BIRTHDAY</div>
                  <div className="text-white">{member.birthday}</div>
                </div>
                <div>
                  <div className="text-[hsl(var(--discord-muted))] text-xs">HEIGHT</div>
                  <div className="text-white">{member.height}</div>
                </div>
                <div>
                  <div className="text-[hsl(var(--discord-muted))] text-xs">GENERATION</div>
                  <div className="text-white">{member.generation}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap space-x-2">
                <Button
                  className="bg-[hsl(var(--jkt-orange))] hover:bg-[hsl(var(--jkt-light-orange))] text-white text-sm px-3 py-1 flex items-center"
                >
                  <FaCalendarAlt className="mr-1" /> Schedule
                </Button>
                <Button
                  className="bg-[hsl(var(--discord-blue))] hover:opacity-80 text-white text-sm px-3 py-1 flex items-center"
                >
                  <FaImages className="mr-1" /> Gallery
                </Button>
                <Button
                  className="bg-purple-600 hover:opacity-80 text-white text-sm px-3 py-1 flex items-center"
                >
                  <FaInstagram className="mr-1" /> Social Media
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default MemberInfo;
