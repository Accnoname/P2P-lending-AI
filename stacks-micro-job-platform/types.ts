
export enum JobStatus {
  OPEN = 'Open',
  CLAIMED = 'Claimed',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed', // Worker has claimed the reward
  CANCELLED = 'Cancelled',
}

export enum VoteDecision {
  APPROVE = 'Approve',
  REJECTE = 'Reject',
}

export interface User {
  stxAddress: string;
  balance: number;
}

export interface Vote {
  voter: string;
  decision: VoteDecision;
}

export interface Job {
  id: number;
  description: string;
  reward: number;
  deadline: Date;
  status: JobStatus;
  poster: string;
  worker: string | null;
  ipfsHash: string | null;
  votes: Vote[];
}
