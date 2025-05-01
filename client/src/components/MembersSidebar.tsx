import React from 'react';

type UserProps = {
  name: string;
  color: string;
  text: string;
  isBot?: boolean;
  status: 'online' | 'offline' | 'idle';
};

const User: React.FC<UserProps> = ({ name, color, text, isBot = false, status }) => {
  let statusColor = '';
  if (status === 'online') statusColor = 'bg-[hsl(var(--discord-green))]';
  else if (status === 'offline') statusColor = 'bg-gray-500';
  else if (status === 'idle') statusColor = 'bg-[hsl(var(--discord-yellow))]';

  return (
    <div className="flex items-center hover:bg-gray-700 rounded px-2 py-1">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center relative`}>
        <span className="text-white text-xs">{text}</span>
        <span className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-[hsl(var(--discord-darker))]`}></span>
      </div>
      <div className="ml-2 text-sm">
        <span className={status === 'online' ? 'text-[hsl(var(--discord-green))]' : 'text-[hsl(var(--discord-muted))]'}>{name}</span>
        {isBot && <span className="ml-1 bg-[hsl(var(--discord-blue))] text-white text-xs px-1 rounded">BOT</span>}
      </div>
    </div>
  );
};

const MembersSidebar: React.FC = () => {
  return (
    <div className="w-60 bg-[hsl(var(--discord-darker))] overflow-y-auto">
      <div className="p-3">
        <div className="text-[hsl(var(--discord-muted))] uppercase text-xs font-semibold mb-2">Online — 15</div>
        <div className="space-y-1">
          <User 
            name="JKT48 Bot" 
            color="bg-[hsl(var(--jkt-orange))]" 
            text="JKT" 
            isBot={true} 
            status="online" 
          />
          
          <User 
            name="Admin" 
            color="bg-purple-600" 
            text="A" 
            status="online" 
          />
          
          <User 
            name="User123" 
            color="bg-[hsl(var(--discord-blue))]" 
            text="ME" 
            status="online" 
          />
        </div>
        
        <div className="text-[hsl(var(--discord-muted))] uppercase text-xs font-semibold mb-2 mt-4">Offline — 42</div>
        <div className="space-y-1">
          <User 
            name="User1" 
            color="bg-gray-600" 
            text="U1" 
            status="offline" 
          />
          
          <User 
            name="User2" 
            color="bg-gray-600" 
            text="U2" 
            status="offline" 
          />
          
          <User 
            name="User3" 
            color="bg-gray-600" 
            text="U3" 
            status="idle" 
          />
        </div>
      </div>
    </div>
  );
};

export default MembersSidebar;
