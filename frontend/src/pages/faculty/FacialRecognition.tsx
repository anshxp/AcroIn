import React, { useState, useRef } from 'react';
import { Upload, Camera, User } from 'lucide-react';

export const FacialRecognition: React.FC = () => {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => setCameraActive(!cameraActive);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Facial Recognition Verification</h1>
          <p>Upload your profile photo and verify with live webcam capture</p>
        </div>
      </div>

      {/* Verification Grid */}
      <div className="verification-grid">
        {/* Profile Photo Upload */}
        <div className="verification-card">
          <div className="verification-header">
            <Upload size={24} />
            <div>
              <h3>Profile Photo Upload</h3>
              <p>Upload a clear photo of your face for verification</p>
            </div>
          </div>
          
          <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
            {uploadedPhoto ? (
              <img src={uploadedPhoto} alt="Uploaded" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
            ) : (
              <>
                <div className="upload-icon">
                  <User size={32} />
                </div>
                <p className="upload-text">Drop your photo here or click to browse</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <button className="upload-btn">{uploadedPhoto ? 'Change Photo' : 'Choose Photo'}</button>
          </div>
        </div>

        {/* Live Verification */}
        <div className="verification-card">
          <div className="verification-header">
            <Camera size={24} />
            <div>
              <h3>Live Verification</h3>
              <p>Capture a live photo for verification</p>
            </div>
          </div>
          
          <div className="camera-zone">
            {cameraActive ? (
              <div className="camera-active">
                <div className="camera-placeholder" style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={48} style={{ color: '#4ade80' }} />
                </div>
                <p style={{ marginTop: '8px', color: '#4ade80' }}>Camera Active - Position your face</p>
              </div>
            ) : (
              <>
                <div className="camera-icon">
                  <Camera size={32} />
                </div>
                <p className="camera-text">Position your face in the frame</p>
              </>
            )}
            <button className="camera-btn" onClick={toggleCamera}>
              {cameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
