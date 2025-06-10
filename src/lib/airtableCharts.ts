import Airtable from 'airtable';
import { parseISO, format } from 'date-fns';


const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT })
  .base(process.env.AIRTABLE_BASE_ID!);

  const DAYS_PER_BUCKET = 5;

/* ------- Calificación promedio x tarea ------- */
export async function getRatings() {
  const recs = await base(process.env.AIRTABLE_TABLE_TASKS!)
    .select({ fields: ['name', 'avgScore'],
        sort: [{ field:'name', direction: 'asc'}],
     })
    .all();

  return recs.map(r => ({
    tarea: r.get('name')  as string,
    rating: Number(r.get('avgScore')),
  }));
}

/* ------- Entregas por tarea ------- */
export async function getDeliveries() {
  const recs = await base(process.env.AIRTABLE_TABLE_TASKS!)
    .select({ fields: ['name', 'submissions'],
        sort: [{ field: 'name', direction: 'asc' }],
     })
    .all();

  return recs.map(r => ({
    tarea: r.get('name') as string,
    entregas: Number(r.get('submissions')),
  }));
}

/* ------- Histograma de calificaciones ------- */
export async function getGradesArray() {
  const recs = await base(process.env.AIRTABLE_TABLE_GRADES!)
    .select({ fields: ['score'] })
    .all();
  return recs.map(r => Number(r.get('score')));
}

/* ------- Entregas por semana (línea) ------- */
export async function getActivity() {
  const recs = await base(process.env.AIRTABLE_TABLE_WEEKLY!)
    .select({
      fields: ['date', 'deliveries'],
      sort: [{ field: 'date', direction: 'asc' }],
    })
    .all();

  /* convierte filas -> { date: Date, deliveries: number } */
  const rows = recs.map((r) => ({
    date:       parseISO(r.get('date') as string),
    deliveries: Number(r.get('deliveries')),
  }));

  /* agrupa cada N días */
  const buckets: { date: string; value: number }[] = [];
  for (let i = 0; i < rows.length; i += DAYS_PER_BUCKET) {
    const slice = rows.slice(i, i + DAYS_PER_BUCKET);
    const label = `Sem ${buckets.length + 1}`;

    buckets.push({
      date: label,
      value: slice.reduce((sum, r) => sum + r.deliveries, 0),
    });
  }

  return buckets;
}
