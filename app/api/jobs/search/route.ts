import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchJobsForUser } from '@/lib/jobs/search-for-user';
import { parseJobFiltersFromSearchParams } from '@/lib/jobs/parse-filters';

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseJobFiltersFromSearchParams(url.searchParams);

  const result = await searchJobsForUser(supabase, user.id, filters);

  return NextResponse.json(result);
}
