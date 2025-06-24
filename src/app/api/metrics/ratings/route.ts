// ratings/route.ts
import { NextResponse } from 'next/server';
import { getRatings } from '@/lib/airtableCharts';

export const revalidate = 60; // ISR 60 s

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const empresa = searchParams.get('empresa') || undefined;

  const data = await getRatings(empresa);
  return NextResponse.json(data);
}
