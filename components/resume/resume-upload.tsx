'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { validateResumeFile } from '@/lib/resume/validate';
import { cn } from '@/lib/utils';

export function ResumeUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  async function uploadFile(file: File) {
    const validation = validateResumeFile({ type: file.type, size: file.size, name: file.name });
    if (!validation.valid) {
      toast({ title: 'Arquivo inválido', description: validation.error, variant: 'error' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        toast({ title: 'Falha ao enviar currículo', description: data.error, variant: 'error' });
        return;
      }

      if (data.resume?.status === 'failed') {
        toast({
          title: 'Currículo enviado, mas não pôde ser lido',
          description: data.resume.error_message,
          variant: 'error',
        });
      } else {
        toast({ title: 'Currículo enviado e analisado com sucesso', variant: 'success' });
      }

      router.refresh();
    } catch (error) {
      toast({
        title: 'Falha ao enviar currículo',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'error',
      });
    } finally {
      setUploading(false);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) uploadFile(file);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors',
        dragActive ? 'border-primary bg-primary/5' : 'border-border',
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
        {uploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-hover border-t-transparent" />
        ) : (
          <Upload className="h-5 w-5 text-primary-hover" />
        )}
      </div>
      <div>
        <p className="font-medium text-white">Arraste seu currículo em PDF aqui</p>
        <p className="text-sm text-muted">ou clique para selecionar um arquivo (máx. 5MB)</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
        <FileText className="h-4 w-4" /> Selecionar arquivo
      </Button>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
    </div>
  );
}
