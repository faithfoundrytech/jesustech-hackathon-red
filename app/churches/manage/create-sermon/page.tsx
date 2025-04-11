"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function UploadSermonPage() {
  const [uploadMethod, setUploadMethod] = useState<string>('text');
  const [sermonText, setSermonText] = useState<string>('');
  const [document, setDocument] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
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
  
  const handleNext = () => {
    // Store the sermon data in localStorage for now
    // In a real app, you might use form state management or context
    const sermonData = {
      method: uploadMethod,
      text: sermonText,
      documentName: document?.name || '',
      mediaFileName: mediaFile?.name || '',
      videoUrl: videoUrl
    };
    
    localStorage.setItem('sermonData', JSON.stringify(sermonData));
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
          <h1 className="text-2xl font-bold text-light-lavender mb-6">Upload Sermon Details</h1>
          
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-soft-purple text-white rounded-full flex items-center justify-center font-medium">1</div>
              <span className="text-sm mt-1 font-medium text-soft-purple">Upload</span>
            </div>
            <div className="flex-1 h-1 bg-deep-blue-grey/60 self-center mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-deep-blue-grey/60 text-light-lavender/70 rounded-full flex items-center justify-center font-medium">2</div>
              <span className="text-sm mt-1 text-light-lavender/70">Instructions</span>
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
          
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-soft-purple text-white rounded-xl hover:bg-soft-purple/90 focus:outline-none focus:ring-2 focus:ring-soft-purple focus:ring-offset-2 focus:ring-offset-deep-blue-grey shadow-md hover:shadow-lg transition-all"
            >
              Next: Custom Instructions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 