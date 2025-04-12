"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UploadSermonPage() {
  const [step, setStep] = useState<number>(1);
  const [uploadMethod, setUploadMethod] = useState<string>('text');
  const [sermonText, setSermonText] = useState<string>('');
  const [document, setDocument] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [instructionsText, setInstructionsText] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [seriesTheme, setSeriesTheme] = useState<string>('');
  const [authors, setAuthors] = useState<string>('');
  const [reminder, setReminder] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleMethodChange = (method: string) => {
    setUploadMethod(method);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSermonText(e.target.value);
  };
  
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };
  
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInstructionsText(e.target.value);
  };
  
  const handleNextStep = () => {
    setStep(current => Math.min(current + 1, 4));
  };
  
  const handlePreviousStep = () => {
    setStep(current => Math.max(current - 1, 1));
  };

  const handleSubmit = async () => {
    setStatus('submitting');
    
    try {
      // Prepare the data to send to the API
      const formData = {
        title: name,
        description,
        uploadMethod,
        sermonText: uploadMethod === 'text' ? sermonText : null,
        documentName: uploadMethod === 'document' && document ? document.name : null,
        mediaFileName: uploadMethod === 'media' && mediaFile ? mediaFile.name : null,
        videoUrl: uploadMethod === 'youtube' ? videoUrl : null,
        instructionsText,
        seriesTheme,
        authors,
        churchId: localStorage.getItem('activeChurchId') || '' // Get the active church ID from localStorage
      };
      
      // Make the API request
      const response = await fetch('/api/churches/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sermon game');
      }
      
      // Set success and store the created game ID for redirection
      setStatus('success');
      
      // Store the game ID in localStorage for reference on the manage page
      localStorage.setItem('lastCreatedGameId', data.game._id);
      localStorage.setItem('lastCreatedGameTitle', data.game.title);
      
      // Wait a moment before redirecting
      setTimeout(() => {
        window.location.href = '/churches/manage';
      }, 2000);
      
    } catch (error: any) {
      console.error("Error creating game:", error);
      setStatus('error');
      
      // Display error message (in a real app, you'd use a toast or alert)
      alert(`Error: ${error.message}`);
      
      // Reset to idle after a few seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  const getSermonContent = () => {
    switch(uploadMethod) {
      case 'text':
        return sermonText ? 'Text content (excerpt): ' + sermonText.substring(0, 100) + '...' : 'No text provided';
      case 'document':
        return document ? `Document: ${document.name}` : 'No document uploaded';
      case 'media':
        return mediaFile ? `Media file: ${mediaFile.name}` : 'No media uploaded';
      case 'youtube':
        return videoUrl ? `YouTube video: ${videoUrl}` : 'No URL provided';
      default:
        return 'Unknown method';
    }
  };

  // Calculate progress percentage
  const progressPercentage = (step / 4) * 100;
  
  const getErrorMessage = () => {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Failed to create sermon game. Please try again.</p>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-deep-blue-grey py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="bg-soft-indigo rounded-xl shadow-lg p-6 border border-light-lavender/20">
            <CardContent className="text-center pt-8">
              <div className="w-16 h-16 bg-soft-purple rounded-full mx-auto flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-light-lavender mb-4">Game Created Successfully!</CardTitle>
              <p className="text-light-lavender/90 mb-6">
                Your sermon game has been created and will be generated. You can manage it from your dashboard.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              <Link href="/churches/manage" className="px-6 py-2 bg-soft-purple text-white rounded-xl hover:bg-soft-purple/90 shadow-md hover:shadow-lg transition-all inline-block">
                Return to Dashboard
              </Link>
              <button 
                onClick={() => {
                  setStep(1);
                  setStatus('idle');
                }}
                className="px-6 py-2 bg-deep-blue-grey/80 text-light-lavender rounded-xl hover:bg-deep-blue-grey focus:outline-none focus:ring-2 focus:ring-light-lavender/30 shadow-md hover:shadow-lg transition-all inline-block border border-light-lavender/20"
              >
                Create Another Game
              </button>
            </CardFooter>
          </Card>
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
        
        <Card className="bg-soft-indigo rounded-xl shadow-lg border border-light-lavender/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-light-lavender">
              {step === 1 && "Upload Sermon Details"}
              {step === 2 && "Custom Game Instructions"}
              {step === 3 && "Game Metadata"}
              {step === 4 && "Review Sermon Game"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-2">
              <Progress value={progressPercentage} className="h-2 bg-deep-blue-grey/60" />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${step >= 1 ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/60 text-light-lavender/70'} rounded-full flex items-center justify-center font-medium`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={`text-sm mt-1 ${step >= 1 ? 'font-medium text-soft-purple' : 'text-light-lavender/70'}`}>Upload</span>
              </div>
              <div className={`flex-1 h-1 ${step > 1 ? 'bg-soft-purple' : 'bg-deep-blue-grey/60'} self-center mx-2`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${step >= 2 ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/60 text-light-lavender/70'} rounded-full flex items-center justify-center font-medium`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className={`text-sm mt-1 ${step >= 2 ? 'font-medium text-soft-purple' : 'text-light-lavender/70'}`}>Instructions</span>
              </div>
              <div className={`flex-1 h-1 ${step > 2 ? 'bg-soft-purple' : 'bg-deep-blue-grey/60'} self-center mx-2`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${step >= 3 ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/60 text-light-lavender/70'} rounded-full flex items-center justify-center font-medium`}>
                  {step > 3 ? '✓' : '3'}
                </div>
                <span className={`text-sm mt-1 ${step >= 3 ? 'font-medium text-soft-purple' : 'text-light-lavender/70'}`}>Metadata</span>
              </div>
              <div className={`flex-1 h-1 ${step > 3 ? 'bg-soft-purple' : 'bg-deep-blue-grey/60'} self-center mx-2`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${step >= 4 ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/60 text-light-lavender/70'} rounded-full flex items-center justify-center font-medium`}>
                  {step > 4 ? '✓' : '4'}
                </div>
                <span className={`text-sm mt-1 ${step >= 4 ? 'font-medium text-soft-purple' : 'text-light-lavender/70'}`}>Review</span>
              </div>
            </div>
            
            {/* Step 1: Upload Sermon Content */}
            {step === 1 && (
              <>
                {/* Upload Method Selection */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-light-lavender mb-3">Select Upload Method</h2>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      className={`px-4 py-2 rounded-xl ${uploadMethod === 'text' ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/80 text-light-lavender hover:bg-deep-blue-grey'}`}
                      onClick={() => handleMethodChange('text')}
                    >
                      Copy/Paste Text
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-xl ${uploadMethod === 'document' ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/80 text-light-lavender hover:bg-deep-blue-grey'}`}
                      onClick={() => handleMethodChange('document')}
                    >
                      Upload Document
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-xl ${uploadMethod === 'media' ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/80 text-light-lavender hover:bg-deep-blue-grey'}`}
                      onClick={() => handleMethodChange('media')}
                    >
                      Upload Media
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-xl ${uploadMethod === 'youtube' ? 'bg-soft-purple text-white' : 'bg-deep-blue-grey/80 text-light-lavender hover:bg-deep-blue-grey'}`}
                      onClick={() => handleMethodChange('youtube')}
                    >
                      YouTube Link
                    </button>
                  </div>
                </div>
                
                {/* Upload Content Based on Method */}
                <div className="mb-8">
                  {uploadMethod === 'text' && (
                    <div>
                      <label htmlFor="sermon-text" className="block text-sm font-medium text-light-lavender mb-1">
                        Paste Sermon Text
                      </label>
                      <textarea
                        id="sermon-text"
                        rows={10}
                        className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                        placeholder="Paste your sermon text here..."
                        value={sermonText}
                        onChange={handleTextChange}
                      ></textarea>
                    </div>
                  )}
                  
                  {uploadMethod === 'document' && (
                    <div>
                      <label htmlFor="document-upload" className="block text-sm font-medium text-light-lavender mb-1">
                        Upload Document (.docx, .pdf)
                      </label>
                      <input
                        type="file"
                        id="document-upload"
                        accept=".docx,.pdf"
                        onChange={handleDocumentUpload}
                        className="block w-full text-sm text-light-lavender
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-medium
                          file:bg-soft-purple/40 file:text-light-lavender
                          hover:file:bg-soft-purple/50"
                      />
                      {document && (
                        <p className="mt-2 text-sm text-warm-peach">
                          Document ready: {document.name}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {uploadMethod === 'media' && (
                    <div>
                      <label htmlFor="media-upload" className="block text-sm font-medium text-light-lavender mb-1">
                        Upload Media (video or audio)
                      </label>
                      <input
                        type="file"
                        id="media-upload"
                        accept="video/*,audio/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-light-lavender
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-medium
                          file:bg-soft-purple/40 file:text-light-lavender
                          hover:file:bg-soft-purple/50"
                      />
                      {mediaFile && (
                        <p className="mt-2 text-sm text-warm-peach">
                          File ready: {mediaFile.name}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {uploadMethod === 'youtube' && (
                    <div>
                      <label htmlFor="youtube-url" className="block text-sm font-medium text-light-lavender mb-1">
                        YouTube Video URL
                      </label>
                      <input
                        type="url"
                        id="youtube-url"
                        className="w-full p-3 border border-light-lavender/30 rounded-xl focus:ring-soft-purple focus:border-soft-purple bg-deep-blue-grey/40 text-light-lavender"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={handleVideoUrlChange}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Step 2: Custom Game Instructions */}
            {step === 2 && (
              <>
                {/* Upload Method Summary */}
                <div className="bg-deep-blue-grey/40 p-4 rounded-xl mb-6 border border-light-lavender/20">
                  <h3 className="text-md font-medium text-light-lavender">Sermon Content Uploaded</h3>
                  <p className="text-sm text-light-lavender/90 mt-1">
                    {getSermonContent()}
                  </p>
                </div>
                
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
              </>
            )}
            
            {/* Step 3: Game Metadata */}
            {step === 3 && (
              <>
                {/* Previous Steps Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-deep-blue-grey/40 p-4 rounded-xl border border-light-lavender/20">
                    <h3 className="text-md font-medium text-light-lavender">Sermon Content</h3>
                    <p className="text-sm text-light-lavender/90 mt-1">
                      {getSermonContent()}
                    </p>
                  </div>
                  
                  <div className="bg-deep-blue-grey/40 p-4 rounded-xl border border-light-lavender/20">
                    <h3 className="text-md font-medium text-light-lavender">Game Instructions</h3>
                    <p className="text-sm text-light-lavender/90 mt-1 truncate">
                      {instructionsText.length > 50 ? `${instructionsText.substring(0, 50)}...` : instructionsText || 'No special instructions'}
                    </p>
                  </div>
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
              </>
            )}
            
            {/* Step 4: Review */}
            {step === 4 && (
              <>
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
                        onClick={() => setStep(1)}
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
                          {instructionsText || 'No special instructions provided'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setStep(2)}
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
                            <dd className="mt-1 text-sm text-light-lavender">{name || 'N/A'}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-sm font-medium text-light-lavender/60">Description</dt>
                            <dd className="mt-1 text-sm text-light-lavender">{description || 'N/A'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-light-lavender/60">Series Theme</dt>
                            <dd className="mt-1 text-sm text-light-lavender">{seriesTheme || 'N/A'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-light-lavender/60">Authors</dt>
                            <dd className="mt-1 text-sm text-light-lavender">{authors || 'N/A'}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-sm font-medium text-light-lavender/60">Reminder Message</dt>
                            <dd className="mt-1 text-sm text-light-lavender">{reminder || 'N/A'}</dd>
                          </div>
                        </dl>
                      </div>
                      <button 
                        onClick={() => setStep(3)}
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
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-2 bg-deep-blue-grey/80 text-light-lavender rounded-xl hover:bg-deep-blue-grey focus:outline-none focus:ring-2 focus:ring-light-lavender/30 focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all border border-light-lavender/20 mr-4"
                >
                  Back
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={() => window.location.href = '/churches/manage'}
                  className="px-6 py-2 bg-coral-pink text-white rounded-xl hover:bg-coral-pink/90 focus:outline-none focus:ring-2 focus:ring-coral-pink focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all"
                >
                  Reject & Start Over
                </button>
              )}
            </div>
            
            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-soft-purple text-white rounded-xl hover:bg-soft-purple/90 focus:outline-none focus:ring-2 focus:ring-soft-purple focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all"
                disabled={step === 3 && !name}
              >
                {step === 1 && "Next: Custom Instructions"}
                {step === 2 && "Next: Add Metadata"}
                {step === 3 && "Next: Review Game"}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
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
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 