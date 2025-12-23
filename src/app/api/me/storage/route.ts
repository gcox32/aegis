import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Database size
    const dbSizeResult = await db.execute(sql`
      SELECT pg_database_size(current_database()) as size
    `);
    const dbSizeBytes = Number(dbSizeResult[0]?.size || 0);

    // File storage size
    const storageSizeResult = await db.execute(sql`
      SELECT sum((metadata->>'size')::bigint) as size FROM storage.objects
    `);
    const storageSizeBytes = Number(storageSizeResult[0]?.size || 0);

    return NextResponse.json({
      database: {
        usedBytes: dbSizeBytes,
      },
      storage: {
        usedBytes: storageSizeBytes,
      },
    });
  } catch (error) {
    console.error('Error fetching storage stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

