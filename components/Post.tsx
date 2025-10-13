import React, { useState } from 'react';
import type { Post as PostType } from '../types';
import { HeartIcon, CommentIcon } from './icons';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
      <div className="p-5 flex items-center space-x-4">
        <img src={post.authorAvatar} alt={post.author} className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-bold text-white">{post.author}</p>
          <p className="text-xs text-gray-400">{post.timestamp}</p>
        </div>
      </div>
      
      <p className="px-5 pb-4 text-gray-300">{post.caption}</p>

      {post.mediaType === 'image' && post.mediaUrl && (
        <img src={post.mediaUrl} alt="Conteúdo do post" className="w-full object-cover" />
      )}
      {post.mediaType === 'video' && post.mediaUrl && (
        <video src={post.mediaUrl} controls className="w-full bg-black">
            Seu navegador não suporta a tag de vídeo.
        </video>
      )}
      
      <div className="p-5">
        <div className="flex items-center space-x-6 text-gray-400">
          <button onClick={() => setLiked(!liked)} className={`flex items-center space-x-2 transition hover:text-red-500 ${liked ? 'text-red-500' : ''}`}>
            <HeartIcon className="w-6 h-6" />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center space-x-2 transition hover:text-cyan-400">
            <CommentIcon className="w-6 h-6" />
            <span>{post.comments.length}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 p-5 space-y-4">
        {post.comments.map(comment => (
          <div key={comment.id} className="flex items-start space-x-3">
            <img src={comment.authorAvatar} alt={comment.author} className="w-8 h-8 rounded-full" />
            <div className="bg-gray-700/50 rounded-lg p-2 px-3 text-sm">
              <p className="font-bold text-white">{comment.author}</p>
              <p className="text-gray-300">{comment.text}</p>
            </div>
          </div>
        ))}
         <div className="flex items-center space-x-3 pt-2">
            <img src={post.authorAvatar} alt="usuário atual" className="w-8 h-8 rounded-full"/>
            <input
                type="text"
                placeholder="Adicione um comentário..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-full py-2 px-4 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
        </div>
      </div>
    </div>
  );
};

export default Post;