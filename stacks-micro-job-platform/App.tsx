
import React, { useState, useEffect, useCallback } from 'react';
import { Job, User } from './types';
import { Header } from './components/Header';
import { contractService } from './services/mockContractService';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { JobDetailPage } from './pages/JobDetailPage';
import { DaoPage } from './pages/DaoPage';

const MOCK_USER: User = {
  stxAddress: 'ST3J2Z4G9P05V2F4202APF30HJXW005A8K2J6F7H3',
  balance: 1250.75,
};

// Simple hash-based routing
const useHashNavigation = () => {
    const [hash, setHash] = useState(window.location.hash);

    const handleHashChange = useCallback(() => {
        setHash(window.location.hash);
    }, []);

    useEffect(() => {
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [handleHashChange]);

    const navigate = (path: string) => {
        window.location.hash = path;
    };
    
    // Parse route and params from hash
    const [route, param] = hash.replace(/^#/, '').split('/');

    return { route: route || 'home', param, navigate };
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { route, param, navigate } = useHashNavigation();

  const handleConnect = () => {
    // In a real app, this would use @stacks/connect
    setUser(MOCK_USER);
  };

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedJobs = await contractService.getJobs();
      setJobs(fetchedJobs.sort((a,b) => b.id - a.id));
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  const renderPage = () => {
    switch (route) {
        case 'home':
            return <HomePage onNavigate={navigate} />;
        case 'marketplace':
            return <MarketplacePage jobs={jobs} isLoading={isLoading} onSelectJob={(id) => navigate(`job/${id}`)} refreshJobs={fetchJobs} user={user} />;
        case 'job':
            const jobId = parseInt(param, 10);
            return <JobDetailPage jobId={jobId} user={user} onNavigate={navigate} refreshJobs={fetchJobs} />;
        case 'dao':
            return <DaoPage jobs={jobs} isLoading={isLoading} onSelectJob={(id) => navigate(`job/${id}`)} />;
        default:
            return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <Header user={user} onConnect={handleConnect} onNavigate={navigate} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
