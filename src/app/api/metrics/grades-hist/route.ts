// grades-hist/route.ts
import { NextResponse } from 'next/server';
import { getGradesArray } from '@/lib/airtableCharts';

export const revalidate = 60;
export async function GET() {
  return NextResponse.json(await getGradesArray());
}
