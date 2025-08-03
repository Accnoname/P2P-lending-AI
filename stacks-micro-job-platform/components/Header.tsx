
import React from 'react';
import { User } from '../types';
import { StacksIcon } from './Icons';

interface HeaderProps {
  user: User | null;
  onConnect: () => void;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onConnect, onNavigate }) => {
  return (
    <header className="bg-brand-surface/80 backdrop-blur-sm border-b border-brand-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <a href="#home" onClick={() => onNavigate('home')} className="flex items-center space-x-2 text-xl font-bold text-brand-text-primary hover:text-white transition-colors">
                <StacksIcon className="h-7 w-7 text-brand-primary" />
                <span>MicroJobs</span>
            </a>
            <div className="hidden md:flex items-baseline space-x-4">
                <a href="#marketplace" onClick={() => onNavigate('marketplace')} className="text-brand-text-secondary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Marketplace</a>
                <a href="#dao" onClick={() => onNavigate('dao')} className="text-brand-text-secondary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">DAO Voting</a>
            </div>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-3 bg-brand-border/50 px-3 py-2 rounded-lg">
                <div className="text-right">
                    <p className="text-sm font-medium text-white">{`${user.stxAddress.substring(0, 5)}...${user.stxAddress.substring(user.stxAddress.length - 3)}`}</p>
                    <p className="text-xs text-brand-text-secondary">{user.balance.toFixed(2)} STX</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary"></div>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
