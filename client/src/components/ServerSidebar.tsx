import React from 'react';
import { FaDiscord, FaBell, FaPlus } from 'react-icons/fa';

const ServerSidebar: React.FC = () => {
  return (
    <div className="w-[72px] bg-[hsl(var(--discord-sidebar))] flex flex-col items-center pt-3 space-y-2">
      <div className="w-12 h-12 bg-[hsl(var(--discord-blue))] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer">
        <FaDiscord className="text-white text-2xl" />
      </div>
      <div className="w-12 h-1 bg-[hsl(var(--discord-darker))]"></div>
      <div className="w-12 h-12 bg-[hsl(var(--discord-dark))] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer relative">
        <span className="absolute -top-1 -right-1 bg-[hsl(var(--discord-red))] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        <FaBell className="text-white text-lg" />
      </div>
      <div className="w-12 h-12 bg-[hsl(var(--jkt-orange))] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer border-2 border-white">
        <span className="text-white font-bold">JKT</span>
      </div>
      <div className="w-12 h-12 bg-[#9B59B6] rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer">
        <span className="text-white font-bold">48G</span>
      </div>
      <div className="w-12 h-12 bg-gray-600 text-gray-300 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer">
        <FaPlus className="text-xl" />
      </div>
    </div>
  );
};

export default ServerSidebar;
