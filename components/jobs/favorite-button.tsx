'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFavorite } from '@/lib/actions/favorites';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function FavoriteButton({
  jobId,
  initialFavorited,
  size = 'sm',
}: {
  jobId: string;
  initialFavorited: boolean;
  size?: 'sm' | 'md';
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const optimistic = !favorited;
    setFavorited(optimistic);

    startTransition(async () => {
      const result = await toggleFavorite(jobId);
      if (result.error) {
        setFavorited(!optimistic);
        toast({ title: 'Não foi possível salvar a vaga', description: result.error, variant: 'error' });
        return;
      }
      setFavorited(result.favorited);
      toast({
        title: result.favorited ? 'Vaga salva nos favoritos' : 'Vaga removida dos favoritos',
        variant: 'success',
      });
    });
  }

  return (
    <Button
      type="button"
      variant={favorited ? 'secondary' : 'outline'}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remover dos favoritos' : 'Salvar vaga'}
    >
      <Heart className={cn('h-4 w-4', favorited && 'fill-danger text-danger')} />
      {favorited ? 'Salva' : 'Salvar'}
    </Button>
  );
}
