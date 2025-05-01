import React from 'react';
import MessageItem from './MessageItem';

interface UserProps {
  username: string;
  avatarColor: string;
  avatarText: string;
}

interface UserMessageProps {
  user: UserProps;
  message: string;
  timestamp: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ user, message, timestamp }) => {
  const UserAvatar = () => (
    <div className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center`}>
      <span className="text-white text-xs">{user.avatarText}</span>
    </div>
  );

  return (
    <MessageItem
      avatar={<UserAvatar />}
      username={user.username}
      timestamp={timestamp}
      content={<div className="text-white">{message}</div>}
    />
  );
};

export default UserMessage;
