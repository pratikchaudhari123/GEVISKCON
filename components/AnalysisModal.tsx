import React, { useState, useEffect } from 'react';
import { analyzeInventory } from '../services/geminiService';
import { InventoryItem } from '../types';
import { Loader } from './Loader';
import { Modal } from './Modal';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

// Simple markdown to HTML renderer
const renderMarkdown = (text: string) => {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\n/g, '<br />'); // Newlines

  return { __html: html };
};


export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, items }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      const performAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');

        if (!items || items.length === 0) {
          setAnalysis('No inventory data found to analyze. Add some raw materials first.');
          setIsLoading(false);
          return;
        }

        try {
          setStatus('Analyzing your current inventory...');
          const result = await analyzeInventory(items);
          setAnalysis(result);

        } catch (error) {
          console.error('Failed to perform analysis:', error);
          setAnalysis('Failed to analyze data. Please check your internet connection and API key.');
        } finally {
          setIsLoading(false);
          setStatus('');
        }
      };

      performAnalysis();
    }
  }, [isOpen, items]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Inventory Analysis">
      {isLoading ? (
        <div className="text-center">
            <Loader />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{status}</p>
        </div>
      ) : (
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-800 dark:prose-strong:text-slate-100"
          dangerouslySetInnerHTML={renderMarkdown(analysis)}
        />
      )}
    </Modal>
  );
};