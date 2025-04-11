"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MetadataPage() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [seriesTheme, setSeriesTheme] = useState<string>('');
  const [authors, setAuthors] = useState<string>('');
  const [reminder, setReminder] = useState<string>('');
  const [sermonData, setSermonData] = useState<any>(null);
  const [instructionsData, setInstructionsData] = useState<any>(null);
  
  useEffect(() => {
    // Load data from previous steps
    const storedSermonData = localStorage.getItem('sermonData');
    const storedInstructionsData = localStorage.getItem('instructionsData');
    
    if (storedSermonData) {
      setSermonData(JSON.parse(storedSermonData));
    }
    
    if (storedInstructionsData) {
      setInstructionsData(JSON.parse(storedInstructionsData));
    }
  }, []);
  
  const handleNext = () => {
    // Store the metadata in localStorage
    const metadataData = {
      name,
      description,
      seriesTheme,
      authors,
      reminder
    };
    
    localStorage.setItem('metadataData', JSON.stringify(metadataData));
    window.location.href = '/churches/manage/create-sermon/review';
  };
  
  const handleBack = () => {
    window.location.href = '/churches/manage/create-sermon/instructions';
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
          <h1 className="text-2xl font-bold text-light-lavender mb-6">Game Metadata</h1>
          
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
            <div className="flex-1 h-1 bg-soft-purple self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-soft-purple text-white rounded-full flex items-center justify-center font-medium">3</div>
              <span className="text-sm mt-1 font-medium text-soft-purple">Metadata</span>
            </div>
            <div className="flex-1 h-1 bg-deep-blue-grey/60 self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-deep-blue-grey/60 text-light-lavender/70 rounded-full flex items-center justify-center font-medium">4</div>
              <span className="text-sm mt-1 text-light-lavender/70">Review</span>
            </div>
          </div>
          
          {/* Previous Steps Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {sermonData && (
              <div className="bg-deep-blue-grey/40 p-4 rounded-xl border border-light-lavender/20">
                <h3 className="text-md font-medium text-light-lavender">Sermon Content</h3>
                <p className="text-sm text-light-lavender/90 mt-1">
                  {sermonData.method === 'text' && 'Text content uploaded'}
                  {sermonData.method === 'document' && `Document: ${sermonData.documentName}`}
                  {sermonData.method === 'media' && `Media: ${sermonData.mediaFileName}`}
                  {sermonData.method === 'youtube' && `YouTube: ${sermonData.videoUrl}`}
                </p>
              </div>
            )}
            
            {instructionsData && (
              <div className="bg-deep-blue-grey/40 p-4 rounded-xl border border-light-lavender/20">
                <h3 className="text-md font-medium text-light-lavender">Game Instructions</h3>
                <p className="text-sm text-light-lavender/90 mt-1 truncate">
                  {instructionsData.text.length > 50 ? `${instructionsData.text.substring(0, 50)}...` : instructionsData.text || 'No special instructions'}
                </p>
              </div>
            )}
          </div>
          
          {/* Metadata Form */}
          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-lavender mb-1">
                Game Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                placeholder="Enter a name for this sermon game"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-light-lavender mb-1">
                Game Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                placeholder="Briefly describe this sermon game"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="series-theme" className="block text-sm font-medium text-light-lavender mb-1">
                Series Theme
              </label>
              <input
                type="text"
                id="series-theme"
                value={seriesTheme}
                onChange={(e) => setSeriesTheme(e.target.value)}
                className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                placeholder="If this sermon is part of a series, enter the theme"
              />
            </div>
            
            <div>
              <label htmlFor="authors" className="block text-sm font-medium text-light-lavender mb-1">
                Authors/Speakers
              </label>
              <input
                type="text"
                id="authors"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                placeholder="Name(s) of sermon authors or speakers"
              />
            </div>
            
            <div>
              <label htmlFor="reminder" className="block text-sm font-medium text-light-lavender mb-1">
                Reminder Message (SMS)
              </label>
              <textarea
                id="reminder"
                rows={2}
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                placeholder="Optional message to send as an SMS reminder"
              ></textarea>
              <p className="text-xs text-light-lavender/60 mt-1">
                This message will be sent to users who sign up for sermon game reminders.
              </p>
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
              disabled={!name}
            >
              Next: Review Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 