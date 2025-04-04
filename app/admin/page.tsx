"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import { ADMIN_ADDRESSES, PROJECT_CATEGORIES } from "@/lib/constants";
import type { Project } from "@/lib/projects";
import { addProject } from "@/lib/projectService";

export default function AdminPage() {
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    author: 'chrislarsc.eth',
    authorFid: 192300,
    link: '',
    createdAt: new Date().toISOString(),
  });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const { address } = useAccount();
  const router = useRouter();
  
  useEffect(() => {
    // Check if connected wallet is in admin list
    if (address) {
      const isAdmin = ADMIN_ADDRESSES.some(
        admin => admin.toLowerCase() === address.toLowerCase()
      );
      setIsAuthorized(isAdmin);
      
      // Redirect if not authorized
      if (!isAdmin) {
        router.push('/');
      }
    } else {
      setIsAuthorized(false);
      router.push('/');
    }
    setIsLoading(false);
  }, [address, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewProject(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddProject = async () => {
    // Validate required fields
    if (!newProject.title || !newProject.description || !newProject.link) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Add the new project using our service
      const project = addProject(newProject);
      console.log('Added new project:', project);
      
      // Show success message
      setSuccessMessage('Project added successfully!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setNewProject({
          title: '',
          description: '',
          author: 'chrislarsc.eth',
          authorFid: 192300,
          link: '',
          createdAt: new Date().toISOString(),
        });
      }, 3000);
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="p-4 max-w-[520px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Back to Projects
        </Link>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <form className="space-y-4">
        <div>
          <label className="block mb-1">Title (required)</label>
          <input 
            type="text" 
            name="title"
            className="w-full p-2 border rounded"
            value={newProject.title || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description (required)</label>
          <textarea 
            name="description"
            className="w-full p-2 border rounded"
            value={newProject.description || ''}
            onChange={handleInputChange}
            required
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-1">Author Farcaster Username (required)</label>
          <input 
            type="text" 
            name="author"
            className="w-full p-2 border rounded"
            value={newProject.author || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Author FID (required)</label>
          <input 
            type="number" 
            name="authorFid"
            className="w-full p-2 border rounded"
            value={newProject.authorFid || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Author Wallet Address (optional)</label>
          <input 
            type="text" 
            name="authorAddress"
            className="w-full p-2 border rounded"
            value={newProject.authorAddress || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block mb-1">Project URL (required)</label>
          <input 
            type="url" 
            name="link"
            className="w-full p-2 border rounded"
            value={newProject.link || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Image URL (optional)</label>
          <input 
            type="url" 
            name="image"
            className="w-full p-2 border rounded"
            value={newProject.image || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="featured"
            name="featured"
            checked={!!newProject.featured}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label htmlFor="featured">Featured Project</label>
        </div>
        <button 
          type="button"
          onClick={handleAddProject}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add Project
        </button>
      </form>
    </div>
  );
} 