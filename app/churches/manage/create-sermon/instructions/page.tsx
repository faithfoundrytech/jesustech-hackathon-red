"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CustomInstructionsPage() {
  const [instructionsText, setInstructionsText] = useState<string>('');
  const [sermonData, setSermonData] = useState<any>(null);
  
  useEffect(() => {
    // Load the sermon data from localStorage
    const storedData = localStorage.getItem('sermonData');
    if (storedData) {
      setSermonData(JSON.parse(storedData));
    }
  }, []);
  
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstructionsText(e.target.value);
  };
  
  const handleNext = () => {
    // Store the instructions in localStorage
    localStorage.setItem('instructionsData', JSON.stringify({ text: instructionsText }));
    window.location.href = '/churches/manage/create-sermon/metadata';
  };
  
  const handleBack = () => {
    window.location.href = '/churches/manage/create-sermon';
  };
  
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
          <h1 className="text-2xl font-bold text-light-lavender mb-6">Custom Game Instructions</h1>
          
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-warm-peach text-deep-blue-grey rounded-full flex items-center justify-center font-medium">✓</div>
              <span className="text-sm mt-1 text-warm-peach">Upload</span>
            </div>
            <div className="flex-1 h-1 bg-soft-purple self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-soft-purple text-white rounded-full flex items-center justify-center font-medium">2</div>
              <span className="text-sm mt-1 font-medium text-soft-purple">Instructions</span>
            </div>
            <div className="flex-1 h-1 bg-deep-blue-grey/60 self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-deep-blue-grey/60 text-light-lavender/70 rounded-full flex items-center justify-center font-medium">3</div>
              <span className="text-sm mt-1 text-light-lavender/70">Metadata</span>
            </div>
            <div className="flex-1 h-1 bg-deep-blue-grey/60 self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-deep-blue-grey/60 text-light-lavender/70 rounded-full flex items-center justify-center font-medium">4</div>
              <span className="text-sm mt-1 text-light-lavender/70">Review</span>
            </div>
          </div>
          
          {/* Upload Method Summary */}
          {sermonData && (
            <div className="bg-deep-blue-grey/40 p-4 rounded-xl mb-6 border border-light-lavender/20">
              <h3 className="text-md font-medium text-light-lavender">Sermon Content Uploaded</h3>
              <p className="text-sm text-light-lavender/90 mt-1">
                {sermonData.method === 'text' && 'Text content uploaded successfully.'}
                {sermonData.method === 'document' && `Document uploaded: ${sermonData.documentName}`}
                {sermonData.method === 'media' && `Media file uploaded: ${sermonData.mediaFileName}`}
                {sermonData.method === 'youtube' && `YouTube video linked: ${sermonData.videoUrl}`}
              </p>
            </div>
          )}
          
          {/* Custom Instructions Input */}
          <div className="mb-8">
            <label htmlFor="instructions" className="block text-lg font-medium text-light-lavender mb-3">
              Custom Game Instructions
            </label>
            
            <p className="text-light-lavender/90 mb-4">
              Provide specific instructions on what the AI should focus on when creating the game.
              For example, you can specify themes, biblical characters, or particular verses to emphasize.
            </p>
            
            <textarea
              id="instructions"
              rows={8}
              className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
              placeholder="E.g., Focus on the main message about forgiveness, include questions about Peter's role, emphasize Matthew 18:21-22..."
              value={instructionsText}
              onChange={handleInstructionsChange}
            ></textarea>
            
            <div className="mt-3 text-sm text-light-lavender/80">
              <p>Suggestions:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Specify which scriptural themes to emphasize</li>
                <li>Mention key verses that should be included in questions</li>
                <li>Request certain difficulty levels for different age groups</li>
                <li>Suggest question formats (multiple choice, fill-in-the-blank, etc.)</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-deep-blue-grey/80 text-light-lavender rounded-xl hover:bg-deep-blue-grey focus:outline-none focus:ring-2 focus:ring-light-lavender/30 focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all border border-light-lavender/20"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-soft-purple text-white rounded-xl hover:bg-soft-purple/90 focus:outline-none focus:ring-2 focus:ring-soft-purple focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all"
            >
              Next: Add Metadata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 