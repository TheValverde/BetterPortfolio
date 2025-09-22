'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

interface FileManagerProps {
  onSelectFile: (fileUrl: string, fileName: string) => void;
  selectedFile?: string;
  className?: string;
}

export default function FileManager({ 
  onSelectFile, 
  selectedFile,
  className = '' 
}: FileManagerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/files');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }
      
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch('/api/admin/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }

      // Remove from local state
      setFiles(prev => prev.filter(file => file.fileName !== fileName));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  useEffect(() => {
    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchFiles}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        <button
          onClick={fetchFiles}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.fileName}
              className={`border rounded-lg p-3 transition-colors ${
                selectedFile === file.fileUrl
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="aspect-video bg-muted/50 rounded mb-3 overflow-hidden">
                <Image
                  src={file.fileUrl}
                  alt={file.fileName}
                  width={200}
                  height={150}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectFile(file.fileUrl, file.fileName)}
                    className="flex-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => deleteFile(file.fileName)}
                    className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
