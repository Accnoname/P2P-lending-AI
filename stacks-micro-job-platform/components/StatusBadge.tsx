
import React from 'react';
import { JobStatus } from '../types';

interface StatusBadgeProps {
  status: JobStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: { [key in JobStatus]: string } = {
    [JobStatus.OPEN]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [JobStatus.CLAIMED]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [JobStatus.IN_REVIEW]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    [JobStatus.APPROVED]: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    [JobStatus.COMPLETED]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    [JobStatus.REJECTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
    [JobStatus.CANCELLED]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
