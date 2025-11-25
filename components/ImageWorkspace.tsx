import React, { useState, useRef, useEffect } from 'react';
import { generateEditedImage } from '../services/geminiService';
import { ProcessingStatus, ImageState } from '../types';
import { UploadIcon, WandIcon, DownloadIcon, RefreshIcon, ImageIcon } from './Icons';

export const ImageWorkspace: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    generated: null,
    mimeType: '',
  });
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 9 * 1024 * 1024) { // 9MB safety limit
        setErrorMessage("Image too large. Please upload an image smaller than 9MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageState({
          original: result,
          generated: null, // Reset generated on new upload
          mimeType: file.type,
        });
        setStatus(ProcessingStatus.IDLE);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageState.original || !prompt.trim()) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMessage(null);

    try {
      const generatedBase64 = await generateEditedImage(
        imageState.original,
        imageState.mimeType,
        prompt
      );
      
      // Construct data URI. Gemini usually returns PNG or JPEG. 
      // We assume same as input or standard PNG if undetermined, but usually compatible.
      // Flash Image often returns jpeg or png.
      const resultDataUri = `data:image/jpeg;base64,${generatedBase64}`;

      setImageState(prev => ({ ...prev, generated: resultDataUri }));
      setStatus(ProcessingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to generate image. Please try again.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const applyRestorationPreset = () => {
    const restorePrompt = "Convert this black and white image to full color. Restore fine details, repair any scratches, tears, or dust. Improve sharpness to high definition quality. Crop to 3:2 aspect ratio.";
    setPrompt(restorePrompt);
    // Auto-scroll to text area or highlight it could go here
  };

  const handleDownload = () => {
    if (imageState.generated) {
      const link = document.createElement('a');
      link.href = imageState.generated;
      link.download = `banana-edit-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setImageState({ original: null, generated: null, mimeType: '' });
    setPrompt('');
    setStatus(ProcessingStatus.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Upload Section / Image Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        
        {/* Left: Original / Input */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-semibold text-banana-100 flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-banana-400" />
               Original
             </h3>
             {imageState.original && (
               <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                 <RefreshIcon className="w-4 h-4" /> Reset
               </button>
             )}
          </div>
          
          <div 
            className={`flex-1 relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden bg-slate-800/50 backdrop-blur-sm
              ${!imageState.original ? 'border-slate-600 hover:border-banana-400 hover:bg-slate-800' : 'border-transparent'}
              flex flex-col items-center justify-center
            `}
          >
            {!imageState.original ? (
              <div 
                onClick={triggerFileUpload}
                className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-12 text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UploadIcon className="w-8 h-8 text-banana-400" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Upload Image</h4>
                <p className="text-slate-400 text-sm max-w-xs">Click to upload or drag and drop. Supports JPG, PNG, WEBP.</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-black/40">
                <img 
                  src={imageState.original} 
                  alt="Original" 
                  className="max-w-full max-h-[600px] object-contain shadow-2xl rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Result */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-banana-100 flex items-center gap-2">
              <WandIcon className="w-5 h-5 text-banana-400" />
              Result
            </h3>
            {imageState.generated && (
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 bg-banana-500/10 hover:bg-banana-500/20 text-banana-400 text-sm rounded-lg transition-all"
              >
                <DownloadIcon className="w-4 h-4" /> Download
              </button>
            )}
          </div>

          <div className="flex-1 rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden relative flex items-center justify-center min-h-[400px]">
            {status === ProcessingStatus.PROCESSING ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-banana-500/30 border-t-banana-500 rounded-full animate-spin"></div>
                <p className="text-banana-200 font-medium">Processing with Gemini...</p>
              </div>
            ) : imageState.generated ? (
              <img 
                src={imageState.generated} 
                alt="Generated" 
                className="max-w-full max-h-[600px] object-contain shadow-2xl rounded-lg"
              />
            ) : (
              <div className="text-slate-500 flex flex-col items-center gap-2">
                <WandIcon className="w-12 h-12 opacity-20" />
                <p>Edited image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              How would you like to edit this image?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Add a cyberpunk neon filter', 'Remove the background', 'Turn it into a sketch'..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-banana-500/50 focus:border-banana-500 transition-all resize-none h-28"
              disabled={!imageState.original || status === ProcessingStatus.PROCESSING}
            />
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold py-1.5">Presets:</span>
              <button 
                onClick={applyRestorationPreset}
                disabled={!imageState.original}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-banana-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                ✨ Restore B&W Photo (HD)
              </button>
              <button 
                onClick={() => setPrompt("Denoise the image to remove grain, sharpen fine details, and enhance clarity and contrast for a clean high-definition look.")}
                disabled={!imageState.original}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                🔍 Denoise & Enhance
              </button>
              <button 
                onClick={() => setPrompt("Make this image look like a vintage polaroid.")}
                disabled={!imageState.original}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                📷 Vintage
              </button>
              <button 
                onClick={() => setPrompt("Turn this into a professional oil painting.")}
                disabled={!imageState.original}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                🎨 Oil Painting
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-end md:w-48">
             <button
              onClick={handleGenerate}
              disabled={!imageState.original || !prompt || status === ProcessingStatus.PROCESSING}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
                ${!imageState.original || !prompt || status === ProcessingStatus.PROCESSING
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-banana-500 to-banana-600 hover:from-banana-400 hover:to-banana-500 text-slate-900 shadow-banana-500/25'}
              `}
            >
              <WandIcon className="w-5 h-5" />
              {status === ProcessingStatus.PROCESSING ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
            {errorMessage}
          </div>
        )}
      </div>

    </div>
  );
};