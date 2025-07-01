// deliveries/route.ts
import { NextResponse } from 'next/server';
import { getDeliveries } from '@/lib/airtableCharts';

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const empresa = searchParams.get('empresa') || undefined;

  const data = await getDeliveries(empresa);
  return NextResponse.json(data);
}
