
import React, { useMemo } from 'react';
import { Job, JobStatus } from '../types';
import { Spinner } from '../components/Spinner';
import { CheckCircleIcon, XCircleIcon } from '../components/Icons';

interface DaoPageProps {
  jobs: Job[];
  isLoading: boolean;
  onSelectJob: (id: number) => void;
}

const VoteCard: React.FC<{ job: Job; onSelect: (id: number) => void }> = ({ job, onSelect }) => {
  const approvals = job.votes.filter(v => v.decision === 'Approve').length;
  const rejections = job.votes.filter(v => v.decision === 'Reject').length;
  
  return (
    <div 
        className="bg-brand-surface border border-brand-border rounded-lg p-5 transition-all duration-300 shadow-lg hover:border-brand-primary cursor-pointer"
        onClick={() => onSelect(job.id)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-white">Review Job #{job.id}</h3>
        <span className="text-xs text-brand-text-secondary">Awaiting Votes</span>
      </div>
      <p className="mt-2 text-sm text-brand-text-secondary h-10 overflow-hidden text-ellipsis">{job.description}</p>
      <div className="mt-4 pt-4 border-t border-brand-border">
        <a href={`https://ipfs.io/ipfs/${job.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline break-all">
          IPFS: {job.ipfsHash}
        </a>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-white">{approvals}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-white">{rejections}</span>
              </div>
          </div>
          <button onClick={() => onSelect(job.id)} className="bg-brand-primary text-white font-bold py-1.5 px-3 rounded-md text-sm hover:bg-brand-primary/90">
            Vote Now
          </button>
        </div>
      </div>
    </div>
  );
};


export const DaoPage: React.FC<DaoPageProps> = ({ jobs, isLoading, onSelectJob }) => {
  const jobsInReview = useMemo(() => {
    return jobs.filter(job => job.status === JobStatus.IN_REVIEW);
  }, [jobs]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">DAO Voting Portal</h1>
        <p className="mt-2 text-brand-text-secondary">Review submitted work and cast your vote to ensure quality and fairness.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        jobsInReview.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsInReview.map(job => (
              <VoteCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-surface rounded-lg border border-brand-border">
            <h3 className="text-xl font-semibold">All clear!</h3>
            <p className="text-brand-text-secondary mt-2">There are no job submissions awaiting review at this time.</p>
          </div>
        )
      )}
    </div>
  );
};
