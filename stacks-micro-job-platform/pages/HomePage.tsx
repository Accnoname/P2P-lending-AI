
import React from 'react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-brand-surface border border-brand-border rounded-lg p-6 text-center">
    <p className="text-4xl font-bold text-brand-primary">{value}</p>
    <p className="text-brand-text-secondary mt-2">{label}</p>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in">
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white">
          The Decentralized <span className="text-brand-primary">Micro-Job</span> Economy
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text-secondary">
          Find work, hire talent, and get paid securely on the Stacks blockchain. Fairly governed by a DAO, powered by you.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => onNavigate('marketplace')} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-primary/90 transition-transform transform hover:scale-105">
            Find a Job
          </button>
          <button onClick={() => onNavigate('marketplace')} className="bg-brand-surface text-brand-text-primary font-bold py-3 px-8 rounded-lg text-lg border border-brand-border hover:border-brand-primary transition-all">
            Post a Job
          </button>
        </div>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard value="1,204" label="Total Jobs Posted" />
          <StatCard value="45,800" label="Total STX Paid" />
          <StatCard value="512" label="DAO Members" />
          <StatCard value="78" label="Active Jobs" />
        </div>
      </section>
    </div>
  );
};
