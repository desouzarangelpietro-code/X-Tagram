import React from 'react';
import type { AdminProfile, Post as PostType } from '../types';
import Post from './Post';
import CreatePost from './CreatePost';
import { generateImageFromPrompt } from '../services/geminiService';

interface FeedProps {
  admin: AdminProfile;
  posts: PostType[];
  setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
}

const Feed: React.FC<FeedProps> = ({ admin, posts, setPosts }) => {

  const handleCreatePost = async (caption: string, file: File | null) => {
    let mediaUrl = '';
    let mediaType: PostType['mediaType'] = 'none';

    if (file) {
      mediaUrl = URL.createObjectURL(file);
      mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    } else if (caption) {
      const generatedImageUrl = await generateImageFromPrompt(caption);
      if (generatedImageUrl) {
        mediaUrl = generatedImageUrl;
        mediaType = 'image';
      }
    }
    
    const newPost: PostType = {
      id: `post${Date.now()}`,
      author: admin.userName,
      authorAvatar: admin.avatar,
      caption,
      mediaUrl,
      mediaType,
      likes: 0,
      comments: [],
      timestamp: 'Agora mesmo',
    };
    setPosts(currentPosts => [newPost, ...currentPosts]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Feed Universal</h1>
      <CreatePost admin={admin} onCreatePost={handleCreatePost} />
      <div className="space-y-8 mt-8">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
