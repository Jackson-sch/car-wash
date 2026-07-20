"use client";

import type { DragEvent } from "react";
import { useState, useRef } from "react";
import Image from "next/image";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadLogoAction } from "@/lib/actions/upload";

interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function LogoUploader({ value, onChange, className = "" }: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo seleccionado debe ser una imagen (PNG, JPG, SVG, etc.)");
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      toast.error("La imagen debe ser de un tamaño máximo de 4MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadLogoAction(formData);
      if (res.success && res.url) {
        onChange(res.url);
        toast.success("Logo subido correctamente");
      } else {
        toast.error(res.error || "Ocurrió un error al subir el logo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor de subida");
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative group flex items-center justify-center p-4 border border-border bg-card rounded-xl overflow-hidden aspect-video max-w-xs transition-all shadow-sm">
          <Image
            src={value}
            alt="Logo Preview"
            fill
            className="object-contain transition-all group-hover:scale-[1.02]"
            sizes="(max-width: 320px) 100vw, 320px"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="size-8 rounded-full shadow-lg"
            >
              <DynamicIcon name="X" className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Cargar logo"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all aspect-video max-w-xs text-center ${
            isDragging
              ? "border-secondary bg-secondary/5"
              : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-card/40 hover:bg-card/70"
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 flex flex-col items-center">
              <DynamicIcon name="Loader2" className="size-8 text-secondary animate-spin" />
              <span className="text-xs font-bold text-muted-foreground animate-pulse">
                Subiendo imagen...
              </span>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center">
              <div className="p-2.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-background transition-all">
                <DynamicIcon name="Upload" className="size-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-secondary">Haga clic para cargar</span> o arrastre y suelte
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal px-2">
                Formatos recomendados: PNG, JPG, SVG. Máximo 4MB.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
