
import React, { useState, useMemo } from 'react';
import { Job, User, JobStatus } from '../types';
import { JobCard } from '../components/JobCard';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { contractService } from '../services/mockContractService';

interface MarketplacePageProps {
  jobs: Job[];
  isLoading: boolean;
  onSelectJob: (id: number) => void;
  refreshJobs: () => void;
  user: User | null;
}

type FilterType = 'all' | 'open' | 'my-jobs' | 'my-work';

const CreateJobForm: React.FC<{ user: User; onJobCreated: () => void, onClose: () => void }> = ({ user, onJobCreated, onClose }) => {
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !reward || !deadline) {
            setError('All fields are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await contractService.createJob(user.stxAddress, description, Number(reward), new Date(deadline));
            onJobCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary">Job Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-brand-background border border-brand-border rounded-md shadow-sm p-2 text-white focus:ring-brand-primary focus:border-brand-primary" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="reward" className="block text-sm font-medium text-brand-text-secondary">Reward (STX)</label>
                    <input type="number" id="reward" value={reward} onChange={e => setReward(e.target.value)} min="1" className="mt-1 block w-full bg-brand-background border border-brand-border rounded-md shadow-sm p-2 text-white focus:ring-brand-primary focus:border-brand-primary" required />
                </div>
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-brand-text-secondary">Deadline</label>
                    <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full bg-brand-background border border-brand-border rounded-md shadow-sm p-2 text-white focus:ring-brand-primary focus:border-brand-primary" required />
                </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="bg-brand-surface border border-brand-border text-white font-bold py-2 px-4 rounded-lg hover:border-brand-primary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/90 disabled:bg-gray-500 flex items-center gap-2">
                    {isSubmitting && <Spinner size="sm" />}
                    {isSubmitting ? 'Posting...' : 'Post Job'}
                </button>
            </div>
        </form>
    );
};

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ jobs, isLoading, onSelectJob, refreshJobs, user }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredJobs = useMemo(() => {
    if (!user) return jobs.filter(j => j.status === JobStatus.OPEN);
    switch (filter) {
      case 'open':
        return jobs.filter(j => j.status === JobStatus.OPEN);
      case 'my-jobs':
        return jobs.filter(j => j.poster === user.stxAddress);
      case 'my-work':
        return jobs.filter(j => j.worker === user.stxAddress);
      case 'all':
      default:
        return jobs;
    }
  }, [jobs, filter, user]);

  const FilterButton: React.FC<{ filterType: FilterType, text: string }> = ({ filterType, text }) => (
    <button
        onClick={() => setFilter(filterType)}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${filter === filterType ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-border'}`}
    >
        {text}
    </button>
  );

  return (
    <div className="animate-fade-in">
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a New Job">
            {user ? <CreateJobForm user={user} onClose={() => setIsModalOpen(false)} onJobCreated={() => { setIsModalOpen(false); refreshJobs(); }} /> : <p>Please connect your wallet to create a job.</p>}
        </Modal>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2 bg-brand-surface/80 border border-brand-border p-1 rounded-xl">
          <FilterButton filterType="all" text="All Jobs" />
          <FilterButton filterType="open" text="Open" />
          {user && <FilterButton filterType="my-jobs" text="My Posted Jobs" />}
          {user && <FilterButton filterType="my-work" text="My Work" />}
        </div>
        <button onClick={() => setIsModalOpen(true)} disabled={!user} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/90 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed">
            Post a Job
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : (
        filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <JobCard key={job.id} job={job} onSelect={onSelectJob} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-brand-surface rounded-lg border border-brand-border">
                <h3 className="text-xl font-semibold">No jobs found</h3>
                <p className="text-brand-text-secondary mt-2">There are no jobs matching the current filter.</p>
            </div>
        )
      )}
    </div>
  );
};
