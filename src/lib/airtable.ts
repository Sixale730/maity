import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT })
  .base(process.env.AIRTABLE_BASE_ID!);

export async function findUserByEmail(email: string) {
  const records = await base('Users')
    .select({ 
        filterByFormula: `{email} = "${email.toLowerCase()}"`,
        maxRecords: 1 
    })
    .firstPage();
  return records[0]; // undefined si no existe
}
