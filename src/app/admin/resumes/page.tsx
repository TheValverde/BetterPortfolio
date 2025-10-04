'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, Download, Trash2, Check, X } from 'lucide-react';

interface Resume {
  id: string;
  filename: string;
  displayName: string;
  isActive: boolean;
  fileSize?: number;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/resumes');
      if (!response.ok) throw new Error('Failed to fetch resumes');
      
      const data = await response.json();
      setResumes(data.resumes);
      setActiveResume(data.activeResume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setUploadFile(file);
    setDisplayName(file.name.replace('.pdf', ''));
  };

  const uploadResume = async () => {
    if (!uploadFile || !displayName) {
      setError('Please select a file and enter a display name');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('displayName', displayName);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Create resume record
      const resumeResponse = await fetch('/api/admin/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: result.fileName,
          displayName: displayName,
          fileSize: uploadFile.size,
        }),
      });

      if (!resumeResponse.ok) {
        throw new Error('Failed to create resume record');
      }

      // Refresh the list
      await fetchResumes();
      
      // Reset form
      setUploadFile(null);
      setDisplayName('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const setActive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/resumes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true }),
      });

      if (!response.ok) throw new Error('Failed to set active resume');

      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resume');
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const response = await fetch(`/api/admin/resumes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete resume');

      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading resumes...</div>
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
          <h1 className="text-3xl font-bold">Resume Management</h1>
          <div className="flex gap-4">
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

        {/* Upload Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                Select PDF File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            
            {uploadFile && (
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Hugo Valverde Resume 2025"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            )}

            {uploadFile && displayName && (
              <button
                onClick={uploadResume}
                disabled={uploading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            )}
          </div>
        </div>

        {/* Current Active Resume */}
        {activeResume && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-green-500">Currently Active Resume</h3>
            </div>
            <p className="text-foreground">
              <strong>{activeResume.displayName}</strong> ({activeResume.filename})
            </p>
            <p className="text-sm text-muted-foreground">
              Uploaded: {formatDate(activeResume.uploadedAt)} • Size: {formatFileSize(activeResume.fileSize)}
            </p>
          </div>
        )}

        {/* Resumes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Resumes</h2>
          
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No resumes uploaded yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`border rounded-lg p-4 ${
                    resume.isActive 
                      ? 'border-green-500 bg-green-500/5' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{resume.displayName}</h3>
                        {resume.isActive && (
                          <span className="bg-green-500 text-green-foreground px-2 py-1 rounded text-xs">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        File: {resume.filename}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {formatDate(resume.uploadedAt)} • Size: {formatFileSize(resume.fileSize)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={`/resumes/${resume.filename}`}
                        download={resume.filename}
                        className="p-2 text-primary hover:bg-primary/10 rounded"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      
                      {!resume.isActive && (
                        <button
                          onClick={() => setActive(resume.id)}
                          className="p-2 text-green-500 hover:bg-green-500/10 rounded"
                          title="Set as Active"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
