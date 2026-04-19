import React, { useEffect, useRef, useState } from 'react';
import { Camera, Search, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { facultyAPI } from '../../services/api';
import '../../styles/pages.css';

interface FaceMatchStudent {
  _id: string;
  name?: string;
  roll?: string;
  department?: string;
  profile_image?: string;
}

interface FaceSearchResult {
  student?: FaceMatchStudent;
  confidence?: number;
  match?: boolean;
  message?: string;
}

interface RecentFaceMatch {
  student: FaceMatchStudent;
  confidence: number;
  searchedAt: string;
}

const RECENT_FACE_MATCHES_KEY = 'acroin.recentFaceMatches';
const MAX_RECENT_MATCHES = 8;

export const FacialRecognition: React.FC = () => {
  const navigate = useNavigate();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<FaceSearchResult | null>(null);
  const [recentMatches, setRecentMatches] = useState<RecentFaceMatch[]>([]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(RECENT_FACE_MATCHES_KEY);
      if (!cached) return;

      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return;

      const normalized = parsed.filter(
        (item): item is RecentFaceMatch =>
          Boolean(item?.student?._id && typeof item?.confidence === 'number' && typeof item?.searchedAt === 'string')
      );
      setRecentMatches(normalized.slice(0, MAX_RECENT_MATCHES));
    } catch {
      setRecentMatches([]);
    }
  }, []);

  const persistRecentMatches = (items: RecentFaceMatch[]) => {
    setRecentMatches(items);
    localStorage.setItem(RECENT_FACE_MATCHES_KEY, JSON.stringify(items));
  };

  const cacheMatchedProfile = (searchResult: FaceSearchResult) => {
    if (!searchResult.student?._id) return;

    const newEntry: RecentFaceMatch = {
      student: searchResult.student,
      confidence: Number(searchResult.confidence || 0),
      searchedAt: new Date().toISOString(),
    };

    const nextRecent = [
      newEntry,
      ...recentMatches.filter((item) => item.student._id !== newEntry.student._id),
    ].slice(0, MAX_RECENT_MATCHES);

    persistRecentMatches(nextRecent);
  };

  const formatSearchTime = (isoTime: string) => {
    const date = new Date(isoTime);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString();
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setMessage(null);
    setError(null);
    setCameraError(null);
    setResult(null);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);

    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch {
      setIsCameraActive(false);
      setCameraError('Unable to open camera. You can still upload an image instead.');
    }
  };

  const captureFromCamera = async () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) {
      setCameraError('Camera is not active.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('Unable to capture frame.');
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((capturedBlob) => resolve(capturedBlob), 'image/jpeg', 0.92);
    });

    if (!blob) {
      setCameraError('Capture failed. Please try again.');
      return;
    }

    const capturedFile = new File([blob], `face-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFileSelect(capturedFile);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSearch = async () => {
    if (!file) {
      setError('Please upload a face image first.');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setMessage(null);
      setResult(null);

      const response = await facultyAPI.faceSearch(file) as FaceSearchResult;
      if (!response?.match) {
        setMessage(response?.message || 'No registered student found.');
        return;
      }

      setResult(response);
      cacheMatchedProfile(response);
      setMessage('Potential student match found.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Face search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Facial Recognition</h1>
          <p>Upload a face image to find a matching student profile.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body">
          <div style={{ marginBottom: '14px' }}>
            <p style={{ marginBottom: '10px', color: '#475569', fontSize: '13px' }}>
              Select how you want to provide the face image.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => uploadInputRef.current?.click()}
              >
                <Camera size={16} />
                Choose Image
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={startCamera}
              >
                <Camera size={16} />
                Open Camera
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => cameraFallbackInputRef.current?.click()}
              >
                <Camera size={16} />
                Camera Upload
              </button>
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />

            <input
              ref={cameraFallbackInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                position: 'relative',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#0f172a',
                minHeight: '180px',
                maxWidth: '520px',
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', display: isCameraActive ? 'block' : 'none' }}
              />

              {!isCameraActive && (
                <div
                  style={{
                    color: '#e2e8f0',
                    fontSize: '13px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  Live camera preview appears here
                </div>
              )}
            </div>

            {isCameraActive && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-primary" onClick={captureFromCamera}>
                  <Camera size={16} />
                  Capture Photo
                </button>
                <button type="button" className="btn-secondary" onClick={stopCamera}>
                  Stop Camera
                </button>
              </div>
            )}

            {cameraError && <p style={{ marginTop: '10px', color: '#b91c1c', fontSize: '13px' }}>{cameraError}</p>}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {file && <p style={{ marginBottom: '12px', color: '#475569', fontSize: '13px' }}>Selected: {file.name}</p>}

          <button className="btn-primary" onClick={handleSearch} disabled={isSearching} type="button">
            <Search size={16} />
            {isSearching ? 'Searching...' : 'Search Match'}
          </button>

          {message && <p style={{ marginTop: '12px', color: '#166534', fontSize: '13px' }}>{message}</p>}
          {error && <p style={{ marginTop: '12px', color: '#b91c1c', fontSize: '13px' }}>{error}</p>}
        </div>
      </div>

      {recentMatches.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <h2 style={{ margin: 0 }}>Recent Face Searches</h2>
              <p style={{ margin: 0 }}>Cached matches from your last searches</p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: '10px' }}>
            {recentMatches.map((item) => (
              <div
                key={`${item.student._id}-${item.searchedAt}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'grid', gap: '2px' }}>
                  <strong style={{ color: '#0f172a' }}>{item.student.name || 'Unknown Student'}</strong>
                  <span style={{ color: '#475569', fontSize: '13px' }}>
                    {item.student.roll || 'Roll NA'} • {item.student.department || 'Department NA'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    Confidence {item.confidence.toFixed(3)} • {formatSearchTime(item.searchedAt)}
                  </span>
                </div>

                <button
                  type="button"
                  className="view-profile-btn"
                  onClick={() => navigate(`/faculty/student/${item.student._id}`)}
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.student && (
        <div className="student-list">
          <div className="student-card">
            {result.student.profile_image ? (
              <img
                src={result.student.profile_image}
                alt={`${result.student.name || 'Student'} profile`}
                className="student-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="student-avatar" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                {(result.student.name || 'ST')
                  .split(' ')
                  .map((part: string) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="student-main">
              <div className="student-header">
                <h3 className="student-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserRound size={16} />
                  Matched Student
                </h3>
                <span className="verified-badge">Confidence {Number(result.confidence || 0).toFixed(3)}</span>
              </div>
              <div className="student-meta">
                <span>{result.student.name}</span>
                <span className="separator">•</span>
                <span>{result.student.roll}</span>
                <span className="separator">•</span>
                <span>{result.student.department}</span>
              </div>
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="view-profile-btn"
                  onClick={() => result.student?._id && navigate(`/faculty/student/${result.student._id}`)}
                  disabled={!result.student?._id}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
