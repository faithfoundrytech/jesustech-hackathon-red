import React, { useState } from 'react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gameData: GameFormData) => void;
}

export interface GameFormData {
  title: string;
  description: string;
  scriptureReference: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  questions?: { question: string; answers: string[]; correctAnswerIndex: number }[];
}

const NewGameModal: React.FC<NewGameModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    scriptureReference: '',
    difficulty: 'medium',
    estimatedTime: 15,
    questions: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {currentStep === 1 ? 'Create New Sermon Game - Basic Info' : 'Game Content'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[...Array(totalSteps)].map((_, index) => (
                <React.Fragment key={index}>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep > index 
                        ? 'bg-indigo-600 text-white' 
                        : currentStep === index + 1 
                          ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' 
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < totalSteps - 1 && (
                    <div 
                      className={`flex-1 h-1 ${
                        currentStep > index + 1 ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Game Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder="e.g. The Prodigal Son"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder="Short description of the game"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scripture Reference*
                </label>
                <input
                  type="text"
                  name="scriptureReference"
                  value={formData.scriptureReference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder="e.g. Luke 15:11-32"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    min={5}
                    max={60}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                The game content and questions will be created in a separate interface after the basic information is saved.
              </p>
              
              <div className="bg-indigo-50 p-4 rounded-md">
                <h4 className="font-medium text-indigo-800 mb-2">Next Steps</h4>
                <ul className="list-disc list-inside text-sm text-indigo-700 space-y-1">
                  <li>Add questions and answer options</li>
                  <li>Upload images or media related to the sermon</li>
                  <li>Set scoring rules</li>
                  <li>Preview and test the game</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {currentStep < totalSteps ? 'Next' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGameModal;