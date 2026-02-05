import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';

// QueryClient Setup
const queryClient = new QueryClient();

// Mock API - Real API laga work chestundi
const fileAPI = {
  uploadedFiles: [],

  // Single file upload
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          const uploadedFile = {
            id: Date.now(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
          };
          fileAPI.uploadedFiles.push(uploadedFile);
          resolve(uploadedFile);
        }
      }, 200);
    });
  },

  // Multiple files upload
  uploadMultipleFiles: async (files, onProgress) => {
    const uploadPromises = Array.from(files).map((file, index) => {
      return fileAPI.uploadFile(file, (prog) => {
        if (onProgress) {
          const totalProgress = ((index * 100) + prog) / files.length;
          onProgress(Math.round(totalProgress));
        }
      });
    });
    return Promise.all(uploadPromises);
  },

  // Get all uploaded files
  getFiles: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return fileAPI.uploadedFiles;
  },

  // Delete file
  deleteFile: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    fileAPI.uploadedFiles = fileAPI.uploadedFiles.filter(f => f.id !== id);
    return { success: true };
  },
};

// 1. Single File Upload Component
function SingleFileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: (file) => fileAPI.uploadFile(file, setUploadProgress),
    onSuccess: (data) => {
      alert(`✅ File uploaded: ${data.name}`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      alert('❌ Upload failed: ' + error.message);
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Image preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  return (
    <div className="section mt-5">
      <h2>Single File Upload</h2>
      
      <div className="upload-area">
        <input
          type="file"
          onChange={handleFileSelect}
          className="file-input"
          accept="image/*,.pdf,.doc,.docx"
        />
        
        {selectedFile && (
          <div className="file-info">
            <p>📄 {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            <p>Type: {selectedFile.type}</p>
          </div>
        )}

        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" className="preview-img" />
          </div>
        )}

        {uploadMutation.isLoading && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isLoading}
          className="btn-primary"
        >
          {uploadMutation.isLoading ? `⏳ Uploading... ${uploadProgress}%` : 'Upload File'}
        </button>
      </div>
    </div>
  );
}

// 2. Multiple Files Upload Component
function MultipleFilesUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: (files) => fileAPI.uploadMultipleFiles(files, setUploadProgress),
    onSuccess: (data) => {
      alert(`✅ ${data.length} files uploaded successfully!`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setSelectedFiles([]);
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select files first!');
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  return (
    <div className="section">
      <h2> Multiple Files Upload</h2>
      
      <div className="upload-area">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
        />

        {selectedFiles.length > 0 && (
          <div className="files-list">
            <h3>Selected Files ({selectedFiles.length}):</h3>
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span>📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                <button 
                  onClick={() => removeFile(index)}
                  className="btn-remove"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadMutation.isLoading && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploadMutation.isLoading}
          className="btn-primary"
        >
          {uploadMutation.isLoading 
            ? `⏳ Uploading ${uploadProgress}%...` 
            : ` Upload ${selectedFiles.length} Files`}
        </button>
      </div>
    </div>
  );
}

// 3. Drag & Drop Upload Component
function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const uploadMutation = useMutation({
    mutationFn: (files) => fileAPI.uploadMultipleFiles(files),
    onSuccess: () => {
      alert('✅ Files uploaded!');
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setFiles([]);
    },
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleUpload = () => {
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  };

  return (
    <div className="section">
      <h2> Drag & Drop Upload</h2>
      
      <div
        className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <div className="drag-text">
            <p>📁 Drag & Drop files here</p>
            <p>or click to select</p>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="file-input-hidden"
            />
          </div>
        ) : (
          <div className="files-list">
            <p>✅ {files.length} files selected</p>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                {file.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isLoading}
          className="btn-primary"
          style={{ marginTop: '15px' }}
        >
          {uploadMutation.isLoading ? '⏳ Uploading...' : ' Upload Files'}
        </button>
      )}
    </div>
  );
}

// 4. Uploaded Files List Component
function UploadedFilesList() {
  const { data: files, isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: fileAPI.getFiles,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fileAPI.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  if (isLoading) return <div className="loading">Loading files...</div>;

  return (
    <div className="section mb-5">
      <h2>📂 Uploaded Files ({files?.length || 0})</h2>
      
      {files?.length === 0 ? (
        <p className="empty-state">No files uploaded yet</p>
      ) : (
        <div className="uploaded-files-grid">
          {files?.map((file) => (
            <div key={file.id} className="uploaded-file-card">
              {file.type.startsWith('image/') && (
                <img src={file.url} alt={file.name} className="file-thumbnail" />
              )}
              <div className="file-details">
                <h4>{file.name}</h4>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                <p>Type: {file.type}</p>
                <button
                  onClick={() => deleteMutation.mutate(file.id)}
                  className="btn-danger"
                  disabled={deleteMutation.isLoading}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. File Upload with Validation
function ValidatedFileUpload() {
  const [error, setError] = useState('');

  const uploadMutation = useMutation({
    mutationFn: fileAPI.uploadFile,
    onSuccess: () => {
      alert('✅ File uploaded!');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const validateAndUpload = (e) => {
    const file = e.target.files[0];
    setError('');

    if (!file) return;

    // Validation rules
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

    if (file.size > maxSize) {
      setError('❌ File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('❌ Only JPG, PNG, GIF, PDF files allowed');
      e.target.value = '';
      return;
    }

    // If valid, upload
    uploadMutation.mutate(file);
  };

  return (
    <div className="section">
      <h2>✅ File Upload with Validation</h2>
      <p className="info">Max size: 5MB | Allowed: JPG, PNG, GIF, PDF</p>
      
      <input
        type="file"
        onChange={validateAndUpload}
        className="file-input"
        accept=".jpg,.jpeg,.png,.gif,.pdf"
      />

      {error && <div className="error">{error}</div>}
      {uploadMutation.isLoading && <div className="loading">⏳ Uploading...</div>}
    </div>
  );
}

// Main App
function MainApp() {
  return (
    <div className="app">
     
      <div className="container">
        <SingleFileUpload />
        <MultipleFilesUpload />
        <DragDropUpload />
        <ValidatedFileUpload />
        <UploadedFilesList />
      </div>
    </div>
  );
}

// Root Component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        //   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        //   padding: 20px;
        }

        .app {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          background: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .header h1 {
          color: #667eea;
          margin-bottom: 10px;
        }

        .container {
          display: grid;
          gap: 20px;
        }

        .section {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .section h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .upload-area {
          border: 2px dashed #ddd;
          border-radius: 10px;
          padding: 30px;
          text-align: center;
        }

        .file-input {
          display: block;
          margin: 0 auto 20px;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
          max-width: 400px;
        }

        .file-input:hover {
          border-color: #667eea;
        }

        .file-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          text-align: left;
        }

        .file-info p {
          margin: 5px 0;
          color: #666;
        }

        .preview {
          margin: 20px 0;
        }

        .preview-img {
          max-width: 300px;
          max-height: 300px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .progress-bar {
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          margin: 20px 0;
          height: 30px;
        }

        .progress-fill {
          background: linear-gradient(90deg, #667eea, #764ba2);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          transition: width 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 10px;
        }

        .btn-danger:hover:not(:disabled) {
          background: #dc2626;
        }

        .btn-remove {
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .files-list {
          margin: 20px 0;
        }

        .files-list h3 {
          color: #333;
          margin-bottom: 15px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          padding: 12px 15px;
          margin: 10px 0;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .drag-drop-area {
          border: 3px dashed #ddd;
          border-radius: 15px;
          padding: 60px 30px;
          text-align: center;
          background: #fafafa;
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
        }

        .drag-drop-area.dragging {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .drag-text p:first-child {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #667eea;
        }

        .drag-text p:last-child {
          color: #999;
        }

        .file-input-hidden {
          opacity: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          cursor: pointer;
        }

        .uploaded-files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .uploaded-file-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }

        .file-thumbnail {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .file-details {
          padding: 15px;
        }

        .file-details h4 {
          color: #333;
          margin-bottom: 10px;
          font-size: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-details p {
          color: #666;
          font-size: 0.85rem;
          margin: 5px 0;
        }

        .loading {
          text-align: center;
          padding: 30px;
          color: #667eea;
          font-size: 1.1rem;
        }

        .error {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #c33;
          margin: 15px 0;
        }

        .empty-state {
          text-align: center;
          color: #999;
          padding: 40px;
          font-size: 1.1rem;
        }

        .info {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 15px;
          background: #f0f4ff;
          padding: 10px;
          border-radius: 6px;
        }

        @media (max-width: 768px) {
          .uploaded-files-grid {
            grid-template-columns: 1fr;
          }

          .preview-img {
            max-width: 100%;
          }
        }
      `}</style>
    </QueryClientProvider>
  );
}