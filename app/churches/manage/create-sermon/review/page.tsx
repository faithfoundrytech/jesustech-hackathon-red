"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReviewGamePage() {
  const [sermonData, setSermonData] = useState<any>(null);
  const [instructionsData, setInstructionsData] = useState<any>(null);
  const [metadataData, setMetadataData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    // Load data from all previous steps
    const storedSermonData = localStorage.getItem('sermonData');
    const storedInstructionsData = localStorage.getItem('instructionsData');
    const storedMetadataData = localStorage.getItem('metadataData');
    
    if (storedSermonData) {
      setSermonData(JSON.parse(storedSermonData));
    }
    
    if (storedInstructionsData) {
      setInstructionsData(JSON.parse(storedInstructionsData));
    }
    
    if (storedMetadataData) {
      setMetadataData(JSON.parse(storedMetadataData));
    }
  }, []);
  
  const handleBack = () => {
    window.location.href = '/churches/manage/create-sermon/metadata';
  };
  
  const handleEdit = (step: string) => {
    switch (step) {
      case 'upload':
        window.location.href = '/churches/manage/create-sermon';
        break;
      case 'instructions':
        window.location.href = '/churches/manage/create-sermon/instructions';
        break;
      case 'metadata':
        window.location.href = '/churches/manage/create-sermon/metadata';
        break;
      default:
        break;
    }
  };
  
  const handleAccept = () => {
    setStatus('submitting');
    
    // Simulate API call to create sermon game
    setTimeout(() => {
      // In a real app, this would be a fetch call to your API
      // After successful submission, clear localStorage
      setStatus('success');
      
      // Clear localStorage after successful submission
      localStorage.removeItem('sermonData');
      localStorage.removeItem('instructionsData');
      localStorage.removeItem('metadataData');
    }, 1500);
  };
  
  const handleReject = () => {
    // Clear all data and go back to manage page
    localStorage.removeItem('sermonData');
    localStorage.removeItem('instructionsData');
    localStorage.removeItem('metadataData');
    
    window.location.href = '/churches/manage';
  };
  
  const getSermonContent = () => {
    if (!sermonData) return 'No data available';
    
    switch(sermonData.method) {
      case 'text':
        return 'Text content (excerpt): ' + (sermonData.text?.substring(0, 100) + '...' || 'No text provided');
      case 'document':
        return `Document: ${sermonData.documentName}`;
      case 'media':
        return `Media file: ${sermonData.mediaFileName}`;
      case 'youtube':
        return `YouTube video: ${sermonData.videoUrl}`;
      default:
        return 'Unknown method';
    }
  };
  
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-deep-blue-grey py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-soft-indigo rounded-xl shadow-lg p-8 text-center border border-light-lavender/20">
            <div className="w-16 h-16 bg-soft-purple rounded-full mx-auto flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-light-lavender mb-4">Game Created Successfully!</h1>
            <p className="text-light-lavender/90 mb-6">
              Your sermon game has been created and will be generated. You can manage it from your dashboard.
            </p>
            <div className="space-x-4">
              <Link href="/churches/manage" className="px-6 py-2 bg-soft-purple text-white rounded-xl hover:bg-soft-purple/90 shadow-md hover:shadow-lg transition-all inline-block">
                Return to Dashboard
              </Link>
              <Link href="/churches/manage/create-sermon" className="px-6 py-2 bg-deep-blue-grey/80 text-light-lavender rounded-xl hover:bg-deep-blue-grey focus:outline-none focus:ring-2 focus:ring-light-lavender/30 shadow-md hover:shadow-lg transition-all inline-block border border-light-lavender/20">
                Create Another Game
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-deep-blue-grey py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/churches/manage" className="text-coral-pink hover:text-coral-pink/80 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Manage
          </Link>
        </div>
        
        <div className="bg-soft-indigo rounded-xl shadow-lg p-6 border border-light-lavender/20">
          <h1 className="text-2xl font-bold text-light-lavender mb-6">Review Sermon Game</h1>
          
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-warm-peach text-deep-blue-grey rounded-full flex items-center justify-center font-medium">✓</div>
              <span className="text-sm mt-1 text-warm-peach">Upload</span>
            </div>
            <div className="flex-1 h-1 bg-warm-peach self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-warm-peach text-deep-blue-grey rounded-full flex items-center justify-center font-medium">✓</div>
              <span className="text-sm mt-1 text-warm-peach">Instructions</span>
            </div>
            <div className="flex-1 h-1 bg-warm-peach self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-warm-peach text-deep-blue-grey rounded-full flex items-center justify-center font-medium">✓</div>
              <span className="text-sm mt-1 text-warm-peach">Metadata</span>
            </div>
            <div className="flex-1 h-1 bg-soft-purple self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-soft-purple text-white rounded-full flex items-center justify-center font-medium">4</div>
              <span className="text-sm mt-1 font-medium text-soft-purple">Review</span>
            </div>
          </div>
          
          {/* Game Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-light-lavender mb-4">Game Summary</h2>
            
            <div className="border border-light-lavender/20 rounded-xl divide-y divide-light-lavender/20 bg-deep-blue-grey/40">
              {/* Sermon Content */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="font-medium text-light-lavender">Sermon Content</h3>
                  <p className="text-light-lavender/90 text-sm mt-1">{getSermonContent()}</p>
                </div>
                <button 
                  onClick={() => handleEdit('upload')}
                  className="text-coral-pink hover:text-coral-pink/80 text-sm font-medium mt-2 md:mt-0"
                >
                  Edit
                </button>
              </div>
              
              {/* Instructions */}
              <div className="p-4 flex flex-col md:flex-row md:items-start justify-between">
                <div>
                  <h3 className="font-medium text-light-lavender">Game Instructions</h3>
                  <p className="text-light-lavender/90 text-sm mt-1">
                    {instructionsData?.text || 'No special instructions provided'}
                  </p>
                </div>
                <button 
                  onClick={() => handleEdit('instructions')}
                  className="text-coral-pink hover:text-coral-pink/80 text-sm font-medium mt-2 md:mt-0"
                >
                  Edit
                </button>
              </div>
              
              {/* Metadata */}
              <div className="p-4 flex flex-col md:flex-row md:items-start justify-between">
                <div className="flex-grow">
                  <h3 className="font-medium text-light-lavender">Game Metadata</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-light-lavender/60">Name</dt>
                      <dd className="mt-1 text-sm text-light-lavender">{metadataData?.name || 'N/A'}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-light-lavender/60">Description</dt>
                      <dd className="mt-1 text-sm text-light-lavender">{metadataData?.description || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-light-lavender/60">Series Theme</dt>
                      <dd className="mt-1 text-sm text-light-lavender">{metadataData?.seriesTheme || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-light-lavender/60">Authors</dt>
                      <dd className="mt-1 text-sm text-light-lavender">{metadataData?.authors || 'N/A'}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-sm font-medium text-light-lavender/60">Reminder Message</dt>
                      <dd className="mt-1 text-sm text-light-lavender">{metadataData?.reminder || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
                <button 
                  onClick={() => handleEdit('metadata')}
                  className="text-coral-pink hover:text-coral-pink/80 text-sm font-medium mt-2 md:mt-0"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
          
          {/* Information Box */}
          <div className="bg-deep-blue-grey/60 border border-light-lavender/20 rounded-xl p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-light-lavender" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-light-lavender">What happens next?</h3>
                <div className="mt-2 text-sm text-light-lavender/80">
                  <p>
                    After you accept this sermon game, our AI system will process the content and generate interactive
                    questions based on your instructions. This may take a few minutes. Once complete, the game will be
                    available for your congregation to play.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-deep-blue-grey/80 text-light-lavender rounded-xl hover:bg-deep-blue-grey focus:outline-none focus:ring-2 focus:ring-light-lavender/30 focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all border border-light-lavender/20 mr-4"
              >
                Back
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2 bg-coral-pink text-white rounded-xl hover:bg-coral-pink/90 focus:outline-none focus:ring-2 focus:ring-coral-pink focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all"
              >
                Reject & Start Over
              </button>
            </div>
            <button
              onClick={handleAccept}
              className="px-6 py-2 bg-soft-purple text-white rounded-xl hover:bg-soft-purple/90 focus:outline-none focus:ring-2 focus:ring-soft-purple focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all flex items-center"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Accept & Create Game'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 