// ratings/route.ts
import { NextResponse } from 'next/server';
import { getRatings } from '@/lib/airtableCharts';

export const revalidate = 60;           // ISR 60 s

export async function GET() {
  const data = await getRatings();
  return NextResponse.json(data);
}
