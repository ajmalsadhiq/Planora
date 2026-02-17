import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router";
import {
  Upload as UploadIcon,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "lib/constants";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

type UploadProps = {
  onComplete?: (base64Data: string) => void;
};

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const handleZoneClick = () => {
    if (!isSignedIn) return;
    inputRef.current?.click();
  };

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) return;

      const result = reader.result.toString();
      const base64Data = result.includes(",")
        ? result.split(",")[1]!
        : result;

      setProgress(0);
      let current = 0;

      const intervalId = window.setInterval(() => {
        current = Math.min(100, current + PROGRESS_STEP);
        setProgress(current);

        if (current >= 100) {
          window.clearInterval(intervalId);

          if (onComplete) {
            window.setTimeout(() => {
              onComplete(base64Data);
            }, REDIRECT_DELAY_MS);
          }
        }
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFiles = (files: FileList | null) => {
    if (!isSignedIn || !files || files.length === 0) return;
    
    const selected = files[0];
    
    // Validate file size
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds the maximum limit of 50 MB. Your file is ${(selected.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }
    
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(selected.type)) {
      setError(`File type not supported. Please upload a JPG or PNG image.`);
      return;
    }
    
    // Clear any previous errors and process valid file
    setError(null);
    setFile(selected);
    processFile(selected);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isSignedIn) return;
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (!isSignedIn) return;

    const droppedFiles = event.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    handleFiles(droppedFiles);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    handleFiles(event.target.files);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleZoneClick();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="drop-input"
            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleChange}
            tabIndex={-1}
            aria-hidden
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or drag and drop"
                : "Sign in or sign up with puter to upload"}
            </p>
            <p className="help">Maximum file size 50 MB.</p>
            {error && (
              <p className="error" style={{ color: "red", marginTop: "8px", fontSize: "0.875rem" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />

              <p className="status-text">
                {progress < 100
                  ? "Analyzing Floor Plan...."
                  : "Redirecting...."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;