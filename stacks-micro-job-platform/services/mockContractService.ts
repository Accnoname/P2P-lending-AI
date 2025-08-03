
import { Job, JobStatus, VoteDecision, Vote } from '../types';

let jobs: Job[] = [
  {
    id: 1,
    description: 'Design a new logo for a coffee shop brand. The design should be modern, minimalist, and use earthy tones. Deliverables: SVG and PNG files.',
    reward: 150,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: JobStatus.OPEN,
    poster: 'ST1PQHQKV0RJXZFY1DGX8MNSNY750GGH2AF55P5G8',
    worker: null,
    ipfsHash: null,
    votes: [],
  },
  {
    id: 2,
    description: 'Develop a responsive landing page using React and Tailwind CSS. The page needs a hero section, feature list, and a contact form. No backend required.',
    reward: 500,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: JobStatus.CLAIMED,
    poster: 'ST20ATRN26N9P05V2F4202APF30HJXW005A8K2G4Y',
    worker: 'ST3J2Z4G9P05V2F4202APF30HJXW005A8K2J6F7H3',
    ipfsHash: null,
    votes: [],
  },
  {
    id: 3,
    description: 'Write a 1000-word blog post about the benefits of decentralized finance (DeFi). The tone should be informative and accessible to beginners.',
    reward: 80,
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: JobStatus.IN_REVIEW,
    poster: 'ST20ATRN26N9P05V2F4202APF30HJXW005A8K2G4Y',
    worker: 'ST1PQHQKV0RJXZFY1DGX8MNSNY750GGH2AF55P5G8',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    votes: [{ voter: 'ST3J2Z4G9P05V2F4202APF30HJXW005A8K2J6F7H3', decision: VoteDecision.APPROVE }],
  },
   {
    id: 4,
    description: 'Translate a 2-page document from English to Spanish. The document is technical and relates to blockchain technology.',
    reward: 120,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: JobStatus.COMPLETED,
    poster: 'ST1PQHQKV0RJXZFY1DGX8MNSNY750GGH2AF55P5G8',
    worker: 'ST3J2Z4G9P05V2F4202APF30HJXW005A8K2J6F7H3',
    ipfsHash: 'QmZtmD2qt6f7G4eYJMWDCDr4gV213zV1rADr5e5i2GrwVz',
    votes: [
        { voter: 'ST20ATRN26N9P05V2F4202APF30HJXW005A8K2G4Y', decision: VoteDecision.APPROVE },
        { voter: 'ST3J2Z4G9P05V2F4202APF30HJXW005A8K2J6F7H3', decision: VoteDecision.APPROVE }
    ],
  },
];

let nextJobId = jobs.length + 1;
const DAO_VOTE_THRESHOLD = 3;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class MockContractService {
  async getJobs(): Promise<Job[]> {
    await delay(500);
    return [...jobs];
  }

  async getJob(id: number): Promise<Job | undefined> {
    await delay(300);
    return jobs.find(job => job.id === id);
  }

  async createJob(poster: string, description: string, reward: number, deadline: Date): Promise<Job> {
    await delay(1000);
    const newJob: Job = {
      id: nextJobId++,
      poster,
      description,
      reward,
      deadline,
      status: JobStatus.OPEN,
      worker: null,
      ipfsHash: null,
      votes: [],
    };
    jobs.push(newJob);
    return newJob;
  }
  
  async applyJob(jobId: number, workerAddress: string): Promise<Job> {
    await delay(1000);
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status !== JobStatus.OPEN) {
      throw new Error("Job not available for application.");
    }
    job.worker = workerAddress;
    job.status = JobStatus.CLAIMED;
    return job;
  }

  async submitResult(jobId: number, workerAddress: string, ipfsHash: string): Promise<Job> {
    await delay(1200);
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.worker !== workerAddress || job.status !== JobStatus.CLAIMED) {
      throw new Error("Cannot submit result for this job.");
    }
    job.ipfsHash = ipfsHash;
    job.status = JobStatus.IN_REVIEW;
    return job;
  }

  async voteResult(jobId: number, voterAddress: string, decision: VoteDecision): Promise<Job> {
    await delay(1000);
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status !== JobStatus.IN_REVIEW) {
      throw new Error("Job is not in review.");
    }
    if (job.votes.some(v => v.voter === voterAddress)) {
      throw new Error("Voter has already voted.");
    }

    job.votes.push({ voter: voterAddress, decision });

    const approvals = job.votes.filter(v => v.decision === VoteDecision.APPROVE).length;
    const rejections = job.votes.filter(v => v.decision === VoteDecision.REJECTE).length;

    if (job.votes.length >= DAO_VOTE_THRESHOLD) {
      if (approvals > rejections) {
        job.status = JobStatus.APPROVED;
      } else {
        job.status = JobStatus.REJECTED;
      }
    }
    return job;
  }

  async claimReward(jobId: number, workerAddress: string): Promise<Job> {
    await delay(1000);
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.worker !== workerAddress || job.status !== JobStatus.APPROVED) {
        throw new Error("Reward cannot be claimed.");
    }
    job.status = JobStatus.COMPLETED;
    // In a real scenario, this would trigger STX transfer.
    return job;
  }

  async cancelJob(jobId: number, posterAddress: string): Promise<Job> {
    await delay(1000);
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.poster !== posterAddress || job.status !== JobStatus.OPEN) {
        throw new Error("Job cannot be cancelled.");
    }
    job.status = JobStatus.CANCELLED;
    return job;
  }
}

export const contractService = new MockContractService();
