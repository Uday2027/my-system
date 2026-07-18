'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Copy, Download, RefreshCw, Sliders } from 'lucide-react';
import { toast } from 'sonner';

type CharSetType = 'stack' | 'binary' | 'classic';

export default function AsciiArtLab() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [ascii, setAscii] = useState<string>('');
  const [density, setDensity] = useState<number>(60); // Width in characters
  const [brightness, setBrightness] = useState<number>(1.0);
  const [contrast, setContrast] = useState<number>(1.0);
  const [charSet, setCharSet] = useState<CharSetType>('stack');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Default portrait placeholder (a clean geometric profile silhouette)
  const loadDefaultPlaceholder = () => {
    // A simple 100x100 canvas rendering of a portrait silhouette
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 120, 120);

      // Draw head silhouette
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(60, 50, 25, 0, Math.PI * 2); // Head
      ctx.fill();

      // Draw shoulders
      ctx.beginPath();
      ctx.ellipse(60, 95, 45, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw developer glasses (white squares)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(43, 44, 12, 8);
      ctx.fillRect(65, 44, 12, 8);
      ctx.fillRect(55, 47, 10, 2); // Bridge

      // Draw hair spike
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(60, 15);
      ctx.lineTo(55, 30);
      ctx.fill();

      setImageSrc(canvas.toDataURL());
    }
  };

  // Load placeholder on mount
  useEffect(() => {
    loadDefaultPlaceholder();
  }, []);

  // Process image and generate ASCII representation
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate heights based on density (width) to maintain aspect ratio
      const aspectRatio = img.height / img.width;
      // We multiply aspect ratio by 0.55 because monospace fonts are taller than they are wide
      const charAspectRatioHeight = Math.round(density * aspectRatio * 0.55);
      
      canvas.width = density;
      canvas.height = charAspectRatioHeight;

      // Draw image to canvas scaled down to density resolution
      ctx.drawImage(img, 0, 0, density, charAspectRatioHeight);

      // Get pixel details
      const imgData = ctx.getImageData(0, 0, density, charAspectRatioHeight);
      const pixels = imgData.data;

      // Character sets
      const sets = {
        stack: 'NEXTJSPRISMAREACTTS',
        binary: '01',
        classic: '@#*+=-:. '
      };

      const selectedSet = sets[charSet];
      let asciiResult = '';

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Standard relative luminance
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Apply brightness
          gray = gray * brightness;

          // Apply contrast
          // Factor formula: F = (259 * (C + 255)) / (255 * (259 - C))
          const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
          gray = factor * (gray - 128) + 128;

          // Clamp values
          gray = Math.max(0, Math.min(255, gray));

          // Map gray scale (0-255) to character set index
          // Darker pixels (near 0) mapped to denser characters (beginning of array)
          // Lighter pixels (near 255) mapped to spaces/light characters (end of array)
          const charIdx = Math.floor((gray / 255) * (selectedSet.length - 1));
          asciiResult += selectedSet.charAt(charIdx);
        }
        asciiResult += '\n';
      }

      setAscii(asciiResult);
    };
  }, [imageSrc, density, brightness, contrast, charSet]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          toast.success('Image loaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ascii);
    toast.success('ASCII Art copied to clipboard!');
  };

  const downloadTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob([ascii], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'zhu_ascii_art.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded zhu_ascii_art.txt');
  };

  return (
    <div className="border border-border rounded-xl p-6 bg-card text-foreground max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">ASCII Art Lab</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Render images in high-contrast text typography</p>
        </div>
        <button
          onClick={loadDefaultPlaceholder}
          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Reset to default image"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="space-y-5">
          {/* Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-border hover:border-foreground/30 rounded-lg p-6 text-center cursor-pointer transition-colors space-y-2 group bg-neutral-950/20"
          >
            <Upload className="w-5 h-5 mx-auto text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">Upload Image</div>
            <p className="text-[9px] text-muted-foreground/60">Drag and drop or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Settings Sliders */}
          <div className="space-y-4 font-mono text-[10px]">
            {/* Density / Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Density (Width):</span>
                <span className="text-foreground">{density} chars</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Brightness:</span>
                <span className="text-foreground">{brightness.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Contrast:</span>
                <span className="text-foreground">{contrast.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Character Set */}
            <div className="space-y-1.5 pt-1">
              <span className="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">Character Set</span>
              <div className="grid grid-cols-3 gap-1">
                {(['stack', 'binary', 'classic'] as CharSetType[]).map((set) => (
                  <button
                    key={set}
                    onClick={() => setCharSet(set)}
                    className={`py-1 rounded border text-center capitalize transition-colors ${
                      charSet === set
                        ? 'bg-foreground text-background border-foreground font-semibold'
                        : 'border-border bg-neutral-950/20 text-muted-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    {set}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col border border-border rounded-lg bg-neutral-950/30 overflow-hidden h-[240px] md:h-full min-h-[220px]">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/60 border-b border-border shrink-0">
            <span className="text-[10px] text-muted-foreground font-mono">Console Output</span>
            <div className="flex gap-1.5">
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-neutral-800 rounded text-muted-foreground hover:text-white transition-colors"
                title="Copy ASCII Art"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={downloadTextFile}
                className="p-1 hover:bg-neutral-800 rounded text-muted-foreground hover:text-white transition-colors"
                title="Download txt file"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ASCII PRE Panel */}
          <div className="flex-1 p-3 overflow-auto font-mono text-[6px] md:text-[7px] leading-[0.7] md:leading-[0.7] bg-black text-white whitespace-pre select-text">
            {ascii}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image resizing and processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
