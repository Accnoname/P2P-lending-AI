
import React from 'react';
import { Job } from '../types';
import { StatusBadge } from './StatusBadge';
import { StacksIcon } from './Icons';

interface JobCardProps {
  job: Job;
  onSelect: (id: number) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
    const deadlineFormatted = new Date(job.deadline).toLocaleDateString();
    const isPastDeadline = new Date(job.deadline) < new Date();

  return (
    <div 
        onClick={() => onSelect(job.id)}
        className="bg-brand-surface border border-brand-border rounded-lg p-5 hover:border-brand-primary transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-primary/20"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-brand-text-primary pr-4">{`Job #${job.id}`}</h3>
        <StatusBadge status={job.status} />
      </div>
      <p className="mt-2 text-sm text-brand-text-secondary h-10 overflow-hidden text-ellipsis">
        {job.description}
      </p>
      <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2 text-brand-primary font-bold">
            <StacksIcon className="h-5 w-5" />
            <span>{job.reward} STX</span>
        </div>
        <div className={`text-brand-text-secondary ${isPastDeadline ? 'text-red-400' : ''}`}>
            Deadline: {deadlineFormatted}
        </div>
      </div>
    </div>
  );
};
