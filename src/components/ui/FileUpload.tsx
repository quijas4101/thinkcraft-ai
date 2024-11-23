'use client';

import { useState, useRef } from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import { uploadFile, deleteFile } from '@/lib/storage';

interface FileUploadProps {
  projectId: string;
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  onDeleteComplete?: () => void;
  existingFiles?: Array<{ name: string; url: string }>;
}

export function FileUpload({ 
  projectId, 
  onUploadComplete,
  onDeleteComplete,
  existingFiles = []
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { url, fileName } = await uploadFile(projectId, file);
      onUploadComplete(url, fileName);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      await deleteFile(projectId, fileName);
      onDeleteComplete?.();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          loading={uploading}
          variant="outline"
        >
          Upload File
        </Button>
        <span className="text-sm text-gray-500">
          Max size: 10MB
        </span>
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Attached Files</h4>
          <div className="divide-y divide-gray-200">
            {existingFiles.map((file) => (
              <div 
                key={file.name}
                className="py-2 flex justify-between items-center"
              >
                <a 
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {file.name}
                </a>
                <Button
                  onClick={() => handleDelete(file.name)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 