import React, { useState, useEffect, useCallback } from 'react';
import { Job, User, JobStatus, VoteDecision } from '../types';
import { contractService } from '../services/mockContractService';
import { mockIpfsUpload } from '../services/mockIpfsService';
import { Spinner } from '../components/Spinner';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { StacksIcon, CheckCircleIcon, XCircleIcon, DocumentArrowUpIcon } from '../components/Icons';

interface JobDetailPageProps {
  jobId: number;
  user: User | null;
  onNavigate: (path: string) => void;
  refreshJobs: () => void;
}

interface SubmitResultModalProps {
    isOpen: boolean;
    job: Job;
    user: User;
    onClose: () => void;
    onSubmitted: () => void;
}

const SubmitResultModal: React.FC<SubmitResultModalProps> = ({ isOpen, job, user, onClose, onSubmitted }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setError('');
        setUploading(true);
        try {
            const { hash } = await mockIpfsUpload(file);
            setIpfsHash(hash);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!ipfsHash) {
            setError('Please upload the file to get an IPFS hash first.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await contractService.submitResult(job.id, user.stxAddress, ipfsHash);
            onSubmitted();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Work Result">
            <div className="space-y-4">
                <p className="text-sm text-brand-text-secondary">Upload your work to IPFS, then submit the generated hash to the contract for review.</p>
                <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Work File</label>
                    <div className="mt-1 flex items-center space-x-2">
                        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30"/>
                        <button onClick={handleUpload} disabled={uploading || !file} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/90 disabled:bg-gray-500 flex items-center gap-2">
                             {uploading ? <Spinner size="sm" /> : <DocumentArrowUpIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {ipfsHash && (
                    <div className="p-2 bg-brand-background rounded-md border border-brand-border">
                        <p className="text-sm text-green-400">Upload successful!</p>
                        <p className="text-xs text-brand-text-secondary break-all">IPFS Hash: {ipfsHash}</p>
                    </div>
                )}
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="bg-brand-surface border border-brand-border text-white font-bold py-2 px-4 rounded-lg hover:border-brand-primary">Cancel</button>
                    <button onClick={handleSubmit} disabled={!ipfsHash || isSubmitting} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-500 flex items-center gap-2">
                        {isSubmitting && <Spinner size="sm"/>}
                        Submit for Review
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ jobId, user, onNavigate, refreshJobs }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchJob = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedJob = await contractService.getJob(jobId);
      if (fetchedJob) {
        setJob(fetchedJob);
      } else {
        setError('Job not found.');
      }
    } catch (err) {
      setError('Failed to load job details.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);
  
  const handleAction = async (action: () => Promise<any>) => {
    setActionLoading(true);
    setError('');
    try {
        await action();
        await fetchJob(); // Re-fetch job details to update state
        refreshJobs(); // Refresh the main job list
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
        setActionLoading(false);
    }
  };
  
  const handleApply = () => user && handleAction(() => contractService.applyJob(jobId, user.stxAddress));
  const handleCancel = () => user && handleAction(() => contractService.cancelJob(jobId, user.stxAddress));
  const handleClaimReward = () => user && handleAction(() => contractService.claimReward(jobId, user.stxAddress));
  const handleVote = (decision: VoteDecision) => user && handleAction(() => contractService.voteResult(jobId, user.stxAddress, decision));

  if (isLoading) return <div className="flex justify-center p-10"><Spinner /></div>;
  if (!job) return <div className="text-center text-red-400">{error}</div>;

  const isPoster = user?.stxAddress === job.poster;
  const isWorker = user?.stxAddress === job.worker;
  const canApply = user && !isPoster && job.status === JobStatus.OPEN;
  const canCancel = isPoster && job.status === JobStatus.OPEN;
  const canSubmit = isWorker && job.status === JobStatus.CLAIMED;
  const canVote = user && !isWorker && !isPoster && job.status === JobStatus.IN_REVIEW && !job.votes.some(v => v.voter === user.stxAddress);
  const canClaim = isWorker && job.status === JobStatus.APPROVED;
  
  const approvals = job.votes.filter(v => v.decision === VoteDecision.APPROVE).length;
  const rejections = job.votes.filter(v => v.decision === VoteDecision.REJECTE).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        {user && (
            <SubmitResultModal 
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                job={job}
                user={user}
                onSubmitted={() => {
                    setIsSubmitModalOpen(false);
                    fetchJob();
                    refreshJobs();
                }}
            />
        )}
      <div className="bg-brand-surface border border-brand-border rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Job #{job.id}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-4 text-brand-text-secondary">{job.description}</p>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-sm text-brand-text-secondary">Reward</p>
                    <p className="text-lg font-bold text-brand-primary flex items-center justify-center gap-2"><StacksIcon className="w-5 h-5" />{job.reward} STX</p>
                </div>
                <div>
                    <p className="text-sm text-brand-text-secondary">Deadline</p>
                    <p className="text-lg font-bold text-white">{new Date(job.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-sm text-brand-text-secondary">Poster</p>
                    <p className="text-lg font-mono text-xs text-white truncate" title={job.poster}>{`${job.poster.substring(0, 6)}...`}</p>
                </div>
                <div>
                    <p className="text-sm text-brand-text-secondary">Worker</p>
                    <p className="text-lg font-mono text-xs text-white truncate" title={job.worker ?? 'N/A'}>{job.worker ? `${job.worker.substring(0, 6)}...` : 'Not Claimed'}</p>
                </div>
          </div>
        </div>

        {job.status === JobStatus.IN_REVIEW && (
             <div className="p-6 border-t border-b border-brand-border bg-brand-background/30">
                <h3 className="font-bold text-lg mb-3">DAO Review</h3>
                <div className="space-y-3">
                    <p className="text-sm text-brand-text-secondary">
                        Result submitted for review. View the submission on IPFS and cast your vote.
                    </p>
                    {job.ipfsHash && <a href={`https://ipfs.io/ipfs/${job.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline break-all">View Submission: {job.ipfsHash}</a>}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                           <CheckCircleIcon className="w-6 h-6 text-green-500" />
                           <span className="text-white font-bold text-lg">{approvals} Approvals</span>
                        </div>
                         <div className="flex items-center space-x-2">
                           <XCircleIcon className="w-6 h-6 text-red-500" />
                           <span className="text-white font-bold text-lg">{rejections} Rejections</span>
                        </div>
                    </div>
                </div>
             </div>
        )}

        <div className="p-6 bg-brand-surface">
            <h3 className="font-bold text-lg mb-3">Actions</h3>
            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
            <div className="flex flex-wrap gap-4">
                {canApply && <button onClick={handleApply} disabled={actionLoading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-500 flex items-center gap-2">{actionLoading && <Spinner size="sm"/>}Apply for Job</button>}
                {canSubmit && <button onClick={() => setIsSubmitModalOpen(true)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500">Submit Result</button>}
                {canVote && (
                    <div className="flex gap-4">
                        <button onClick={() => handleVote(VoteDecision.APPROVE)} disabled={actionLoading} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 disabled:bg-gray-500 flex items-center gap-2">{actionLoading && <Spinner size="sm"/>}Approve Result</button>
                        <button onClick={() => handleVote(VoteDecision.REJECTE)} disabled={actionLoading} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 disabled:bg-gray-500 flex items-center gap-2">{actionLoading && <Spinner size="sm"/>}Reject Result</button>
                    </div>
                )}
                {canClaim && <button onClick={handleClaimReward} disabled={actionLoading} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 disabled:bg-gray-500 flex items-center gap-2">{actionLoading && <Spinner size="sm"/>}Claim {job.reward} STX</button>}
                {canCancel && <button onClick={handleCancel} disabled={actionLoading} className="bg-red-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-500 flex items-center gap-2">{actionLoading && <Spinner size="sm"/>}Cancel Job</button>}
                 {job.status === JobStatus.COMPLETED && <p className="text-green-400 font-bold">Reward has been paid out.</p>}
                 {job.status === JobStatus.CANCELLED && <p className="text-red-400 font-bold">This job has been cancelled.</p>}
            </div>
        </div>

      </div>
       <button onClick={() => onNavigate('marketplace')} className="mt-6 text-brand-primary hover:underline">&larr; Back to Marketplace</button>
    </div>
  );
};