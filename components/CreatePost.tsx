import React, { useState, useRef } from 'react';
import type { AdminProfile } from '../types';

interface CreatePostProps {
  admin: AdminProfile;
  onCreatePost: (caption: string, file: File | null) => Promise<void>;
}

const CreatePost: React.FC<CreatePostProps> = ({ admin, onCreatePost }) => {
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setMediaPreview({ url, type });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!caption && !mediaFile) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
        await onCreatePost(caption || 'Insira aqui uma legenda filosófica que ninguém vai ler', mediaFile);
        setCaption('');
        setMediaFile(null);
        setMediaPreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    } catch (error) {
        console.error("Falha ao criar post:", error);
        alert("Não foi possível criar o post. A IA pode estar tirando uma soneca.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-start space-x-4">
        <img src={admin.avatar} alt={admin.userName} className="w-12 h-12 rounded-full" />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Insira aqui uma legenda filosófica que ninguém vai ler..."
          className="w-full bg-gray-900/50 border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px] resize-none disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>
      {mediaPreview && (
        <div className="mt-4 flex justify-center">
          {mediaPreview.type === 'image' ? (
            <img src={mediaPreview.url} alt="Pré-visualização" className="max-h-60 w-auto rounded-lg" />
          ) : (
            <video src={mediaPreview.url} controls className="max-h-60 w-auto rounded-lg" />
          )}
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <div>
          <input 
            type="file" 
            accept="image/*,video/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload" 
            disabled={isSubmitting}
          />
          <label htmlFor="file-upload" className={`cursor-pointer text-gray-400 transition ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:text-cyan-400'}`}>
            Anexar Holograma
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!caption && !mediaFile)}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait disabled:scale-100"
        >
          {isSubmitting ? (!mediaFile ? 'Gerando Holograma...' : 'Publicando...') : 'Postar'}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;