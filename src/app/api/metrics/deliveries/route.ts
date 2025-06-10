// deliveries/route.ts
import { NextResponse } from 'next/server';
import { getDeliveries } from '@/lib/airtableCharts';

export const revalidate = 60;
export async function GET() {
  return NextResponse.json(await getDeliveries());
}
