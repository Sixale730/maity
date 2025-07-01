import Airtable from 'airtable';
import { parseISO, format } from 'date-fns';


const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT })
  .base(process.env.AIRTABLE_BASE_ID!);
  const DAYS_PER_BUCKET = 5;



/* ------- Calificación promedio x tarea ------- */
export async function getRatings(empresaFilter?: string) {
  const recs = await base(process.env.AIRTABLE_TABLE_CALIF!)
    .select({ fields: ['Tarea', 'Calificación', 'Empresa (from Empresas)'] })
    .all();
  
  // Agrupar calificaciones por tarea
  const agrupado: Record<string, number[]> = {};

  recs.forEach((r) => {
    const tarea = r.get('Tarea')?.toString();
    const calificacion = Number(r.get('Calificación'));
    const empresaLookup = r.get('Empresa (from Empresas)');
    const empresa = Array.isArray(empresaLookup) ? empresaLookup[0] : empresaLookup?.toString();

    console.log({ tarea, calificacion, empresa });

    // Ignora registros sin calificación
    if (!tarea || isNaN(calificacion)) return;
    if (empresaFilter && empresa !== empresaFilter) return;

    if (!agrupado[tarea]) agrupado[tarea] = [];
    agrupado[tarea].push(calificacion);
  });

  // Verificacion
  console.log('Agrupado:', agrupado);

  // Calcular promedio (en escala 100)
  return Object.entries(agrupado).map(([tarea, calificaciones]) => ({
    tarea,
    rating: Number(
  (
    (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length) * 20
  ).toFixed(2)
)
  }));
}



/* ------- Entregas por tarea ------- */
export async function getDeliveries(empresaFilter?: string) {
  const recs = await base(process.env.AIRTABLE_TABLE_CALIF!)
    .select({ fields: ['Tarea', 'Empresa (from Empresas)'] })
    .all();

    const conteo: Record<string, number> = {};

  recs.forEach((r) => {
    const tarea = r.get('Tarea')?.toString();
    const empresaLookup = r.get('Empresa (from Empresas)');
    const empresa = Array.isArray(empresaLookup) ? empresaLookup[0] : empresaLookup?.toString();

    if (!tarea) return;
    if (empresaFilter && empresa !== empresaFilter) return;

    conteo[tarea] = (conteo[tarea] || 0) + 1;
  });

  return Object.entries(conteo).map(([tarea, entregas]) => ({
    tarea,
    entregas,
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

// Usuarios
export async function getUsersPerformance() {
  const records = await base(process.env.AIRTABLE_TABLE_CALIF!)
    .select({
      fields: ['Nombre', 'Tarea', 'Calificación', 'Empresa (from Empresas)'],
    })
    .all();

  const usersMap: Record<
    string,
    { empresa: string; calificaciones: number[]; displayName: string }
  > = {};

  records.forEach((r) => {
    const rawNombre = r.get('Nombre')?.toString();
    if (!rawNombre) return;

    const normalizedNombre = rawNombre.trim().toLowerCase(); // clave única
    const displayName = rawNombre.trim(); // conservar nombre con mayúsculas
    const tarea = parseInt(r.get('Tarea')?.toString() || '');
    const calificacion = parseFloat(r.get('Calificación')?.toString() || '');

    if (!normalizedNombre || isNaN(tarea)) return;
    const safeCalificacion = isNaN(calificacion) ? 0 : calificacion;

    // Obtener empresa
    let empresa = 'Sin Empresa';
    const empresaRaw = r.get('Empresa (from Empresas)');
    if (Array.isArray(empresaRaw) && empresaRaw.length > 0) {
      empresa = empresaRaw[0]?.toString();
    } else if (typeof empresaRaw === 'string') {
      empresa = empresaRaw;
    }

    // Inicializar si no existe
    if (!usersMap[normalizedNombre]) {
      usersMap[normalizedNombre] = {
        empresa,
        displayName,
        calificaciones: [],
      };
    }

    // Rellenar hasta la tarea correspondiente con ceros si hace falta
    const calArray = usersMap[normalizedNombre].calificaciones;
    while (calArray.length < tarea) {
      calArray.push(0);
    }

    calArray[tarea - 1] = safeCalificacion;
  });

  // Devolver como arreglo
  return Object.values(usersMap).map(({ empresa, calificaciones, displayName }) => ({
    nombre: displayName,
    empresa,
    calificaciones,
  }));
}



