"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadIcon,
  DownloadIcon,
  RefreshCwIcon,
  CheckIcon,
  ImageIcon,
} from "lucide-react";

interface CompressedImage {
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function compressImage(file: File, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = window.document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function ImageCompressTool() {
  const [originalImage, setOriginalImage] = useState<CompressedImage | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [quality, setQuality] = useState(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    const preview = URL.createObjectURL(file);
    setOriginalImage({
      file,
      preview,
      originalSize: file.size,
      compressedSize: 0,
    });
    setCompressedImage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleCompress = useCallback(async () => {
    if (!originalImage) return;

    setIsCompressing(true);
    try {
      const blob = await compressImage(originalImage.file, quality / 100);
      const compressedFile = new File([blob], originalImage.file.name, {
        type: "image/jpeg",
      });
      const preview = URL.createObjectURL(blob);
      setCompressedImage({
        file: compressedFile,
        preview,
        originalSize: originalImage.originalSize,
        compressedSize: blob.size,
      });
    } catch (error) {
      console.error("Compression failed:", error);
      alert("压缩失败，请重试");
    } finally {
      setIsCompressing(false);
    }
  }, [originalImage, quality]);

  const handleDownload = useCallback(() => {
    if (!compressedImage) return;
    const link = window.document.createElement("a");
    link.href = compressedImage.preview;
    link.download = `compressed_${compressedImage.file.name}`;
    link.click();
  }, [compressedImage]);

  const handleReset = useCallback(() => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage.preview);
    }
    if (compressedImage) {
      URL.revokeObjectURL(compressedImage.preview);
    }
    setOriginalImage(null);
    setCompressedImage(null);
  }, [originalImage, compressedImage]);

  const compressionRatio = originalImage && compressedImage
    ? Math.round((1 - compressedImage.compressedSize / originalImage.originalSize) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            图片压缩
          </Badge>
          {originalImage && (
            <Badge variant="outline" className="text-xs">
              {formatBytes(originalImage.originalSize)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {compressedImage && (
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RefreshCwIcon className="size-3 mr-1" />
              重新开始
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col min-h-0">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
            原始图片
          </div>
          <div
            className={`flex-1 rounded-lg border-2 border-dashed ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-input bg-card"
            } overflow-hidden flex items-center justify-center transition-colors`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {originalImage ? (
              <div className="relative w-full h-full">
                <img
                  src={originalImage.preview}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center cursor-pointer p-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  拖拽图片到此处，或点击上传
                </p>
                <p className="text-xs text-muted-foreground">
                  支持 JPG、PNG、GIF、WebP
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-1 flex items-center justify-between">
            <span>压缩结果</span>
            {compressedImage && (
              <Badge
                variant={compressionRatio > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {compressionRatio > 0 ? `-${compressionRatio}%` : "未减小"}
              </Badge>
            )}
          </div>
          <div className="flex-1 rounded-lg border border-input bg-card overflow-hidden flex items-center justify-center">
            {compressedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={compressedImage.preview}
                  alt="Compressed"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatBytes(compressedImage.compressedSize)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <p className="text-sm">
                  {originalImage ? "点击下方按钮压缩" : "压缩后的图片将显示在这里"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {originalImage && (
        <div className="flex items-center justify-between bg-card rounded-lg p-4 border border-input">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">质量:</span>
              <span className="text-sm font-medium">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-32"
            />
            <div className="flex gap-1">
              {[30, 50, 80].map((q) => (
                <Button
                  key={q}
                  size="sm"
                  variant={quality === q ? "default" : "outline"}
                  onClick={() => setQuality(q)}
                  className="text-xs h-7"
                >
                  {q}%
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {compressedImage && (
              <Button size="sm" onClick={handleDownload}>
                <DownloadIcon className="size-3 mr-1" />
                下载 ({formatBytes(compressedImage.compressedSize)})
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleCompress}
              disabled={isCompressing}
            >
              {isCompressing ? (
                "压缩中..."
              ) : (
                <>
                  <CheckIcon className="size-3 mr-1" />
                  压缩图片
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
