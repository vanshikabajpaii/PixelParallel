import { useState, useRef, useCallback } from 'react';
import './ImageUploader.css';
import { loadImageData } from '../utils/imageProcessing';

// Built-in sample image: a 200×150 synthetic gradient canvas
function generateSampleImage() {
  const w = 200, h = 150;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Draw a colorful gradient pattern
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = Math.round((x / w) * 255);
      const g = Math.round((y / h) * 255);
      const b = Math.round(((x + y) / (w + h)) * 255);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Add some structure
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(20, 20, 60, 40);
  ctx.fillRect(120, 80, 60, 40);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(80, 55, 40, 40);

  return canvas.toDataURL();
}

/**
 * ImageUploader – handles upload of user image or loading the built-in sample.
 * Calls onImageLoaded({imageData, width, height, dataUrl}) when ready.
 */
export default function ImageUploader({ onImageLoaded }) {
  const [status, setStatus] = useState('idle'); // idle | loading | loaded | error
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState(null);
  const [imgInfo, setImgInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleLoad = useCallback(async (src, name = 'image') => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const result = await loadImageData(src, 500, 400);
      const dataUrl = result.canvas.toDataURL();
      setPreview(dataUrl);
      setImgInfo({ name, width: result.width, height: result.height,
                   totalPixels: result.width * result.height });
      setStatus('loaded');
      onImageLoaded?.({ imageData: result.imageData, width: result.width,
                        height: result.height, dataUrl });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Could not load image. Please try a different file.');
    }
  }, [onImageLoaded]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('Image is too large. Please use an image under 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => handleLoad(ev.target.result, file.name);
    reader.onerror = () => { setStatus('error'); setErrorMsg('Failed to read file.'); };
    reader.readAsDataURL(file);
  }

  function handleSample() {
    const src = generateSampleImage();
    handleLoad(src, 'Sample Gradient Image');
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  }

  return (
    <div className="image-uploader">
      <div
        className={`upload-zone${status === 'loading' ? ' loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {status === 'loading' ? (
          <div className="upload-loading">
            <div className="spinner" />
            <p>Loading image…</p>
          </div>
        ) : status === 'loaded' ? (
          <div className="upload-loaded">
            <span className="upload-check">✓</span>
            <p>{imgInfo?.name}</p>
            <p className="upload-sub">
              {imgInfo?.width}×{imgInfo?.height} · {imgInfo?.totalPixels?.toLocaleString()} pixels
            </p>
            <p className="upload-hint">Click to change image</p>
          </div>
        ) : (
          <div className="upload-idle">
            <span className="upload-icon">📁</span>
            <p className="upload-main">Drop an image here, or click to browse</p>
            <p className="upload-sub">JPEG, PNG, WebP · Max 10 MB</p>
          </div>
        )}
      </div>

      {status === 'error' && (
        <div className="upload-error">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="upload-divider">
        <span>or</span>
      </div>

      <button className="btn btn-secondary" onClick={handleSample} disabled={status === 'loading'}>
        🎨 Use Sample Image
      </button>

      {status === 'loaded' && preview && (
        <div className="image-preview-row">
          <div className="image-preview-box">
            <div className="image-preview-label">Original</div>
            <img src={preview} alt="Uploaded" className="image-preview-img" />
          </div>
        </div>
      )}
    </div>
  );
}
