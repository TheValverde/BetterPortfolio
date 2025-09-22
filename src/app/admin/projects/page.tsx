'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import FileUpload from '@/components/FileUpload';
import FileManager from '@/components/FileManager';

interface ProjectFormData {
  title: string;
  description: string;
  longDescription: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'ongoing' | 'planned';
  technologies: string[];
  category: 'ai' | 'real-time-graphics' | 'web' | 'mobile' | 'other';
  client: string;
  role: string;
  responsibilities: string[];
  impact: string;
  images: string[];
  previewImage: string;
  videoUrl: string;
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  order: number;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    longDescription: '',
    startDate: '',
    endDate: '',
    status: 'completed',
    technologies: [],
    category: 'ai',
    client: '',
    role: '',
    responsibilities: [],
    impact: '',
    images: [],
    previewImage: '',
    videoUrl: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    order: 0,
  });
  const [newTech, setNewTech] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newImage, setNewImage] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchProjects = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects?page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.projects);
      setTotalPages(data.totalPages);
      setTotalProjects(data.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      longDescription: project.longDescription || '',
      startDate: project.startDate,
      endDate: project.endDate || '',
      status: project.status,
      technologies: project.technologies,
      category: project.category,
      client: project.client || '',
      role: project.role,
      responsibilities: project.responsibilities,
      impact: project.impact || '',
      images: project.images || [],
      previewImage: project.previewImage || '',
      videoUrl: project.videoUrl || '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      featured: project.featured,
      order: project.order,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      startDate: '',
      endDate: '',
      status: 'completed',
      technologies: [],
      category: 'ai',
      client: '',
      role: '',
      responsibilities: [],
      impact: '',
      images: [],
      previewImage: '',
      videoUrl: '',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      order: 0,
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const url = isCreating ? '/api/admin/projects' : `/api/admin/projects/${selectedProject?.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save project');
      
      await fetchProjects();
      setIsEditing(false);
      setIsCreating(false);
      setSelectedProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addTech = () => {
    if (newTech.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPreviewFromImages = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      previewImage: imageUrl
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, fileUrl]
    }));
    setUploadError(null);
  };

  const handleFileUploadError = (error: string) => {
    setUploadError(error);
  };

  const handleFileSelect = (fileUrl: string, fileName: string) => {
    setFormData(prev => ({
      ...prev,
      previewImage: fileUrl
    }));
    setShowFileManager(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Project Management</h1>
          <div className="flex gap-4">
            <button
              onClick={handleCreate}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Create Project
            </button>
            <Link
              href="/admin"
              className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Projects List */}
        <div className="grid gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-secondary p-6 rounded-lg border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {project.category.replace('_', ' ').replace('-', ' ').toUpperCase()} • {project.status}
                    {project.featured && <span className="ml-2 text-primary">★ Featured</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.technologies.slice(0, 5).map((tech, index) => (
                  <span key={index} className="bg-muted px-2 py-1 rounded text-xs">
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 5 && (
                  <span className="text-muted-foreground text-xs">
                    +{project.technologies.length - 5} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => fetchProjects(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchProjects(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border hover:bg-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => fetchProjects(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Project Count */}
        <div className="text-center text-sm text-muted-foreground mt-4">
          Showing {projects.length} of {totalProjects} projects
        </div>

        {/* Edit/Create Modal */}
        {(isEditing || isCreating) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {isCreating ? 'Create Project' : 'Edit Project'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setSelectedProject(null);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background h-20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Long Description</label>
                      <textarea
                        value={formData.longDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background h-32"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="completed">Completed</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="planned">Planned</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="ai">AI</option>
                          <option value="real-time-graphics">Real-Time Graphics</option>
                          <option value="web">Web</option>
                          <option value="mobile">Mobile</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client</label>
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Impact</label>
                      <textarea
                        value={formData.impact}
                        onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background h-20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Order</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                          className="mr-2"
                        />
                        <label htmlFor="featured" className="text-sm font-medium">Featured</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Technologies</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Add technology"
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                      onKeyPress={(e) => e.key === 'Enter' && addTech()}
                    />
                    <button
                      onClick={addTech}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <span key={index} className="bg-muted px-3 py-1 rounded text-sm flex items-center gap-2">
                        {tech}
                        <button
                          onClick={() => removeTech(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Responsibilities</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      placeholder="Add responsibility"
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                      onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
                    />
                    <button
                      onClick={addResponsibility}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 bg-muted px-3 py-2 rounded text-sm">{responsibility}</span>
                        <button
                          onClick={() => removeResponsibility(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Management */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Project Images</label>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <FileUpload
                      onUpload={handleFileUpload}
                      onError={handleFileUploadError}
                      className="mb-2"
                    />
                    {uploadError && (
                      <div className="text-sm text-destructive bg-destructive/10 border border-destructive px-3 py-2 rounded">
                        {uploadError}
                      </div>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Or enter image URL"
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                    />
                    <button
                      onClick={addImage}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                    >
                      Add URL
                    </button>
                  </div>
                  
                  {/* Preview Image Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Preview Image</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.previewImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, previewImage: e.target.value }))}
                        placeholder="Preview image URL (or select from uploaded files)"
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFileManager(!showFileManager)}
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90"
                      >
                        {showFileManager ? 'Hide Files' : 'Browse Files'}
                      </button>
                    </div>
                    
                    {showFileManager && (
                      <div className="border rounded-lg p-4 bg-secondary/20">
                        <FileManager
                          onSelectFile={handleFileSelect}
                          selectedFile={formData.previewImage}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image List with Drag & Drop */}
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{index + 1}</span>
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-12 h-8 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="flex-1 text-sm truncate">{image}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPreviewFromImages(image)}
                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                          >
                            Set Preview
                          </button>
                          <button
                            onClick={() => removeImage(index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* URLs */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Video URL</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub URL</label>
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Live URL</label>
                    <input
                      type="url"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setSelectedProject(null);
                    }}
                    className="border border-primary text-primary px-6 py-2 rounded hover:bg-primary/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90"
                  >
                    {isCreating ? 'Create Project' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
