import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './usuario.css';
import dynamic from 'next/dynamic';
import { getGradesArray, getDeliveries, getUsersPerformance } from '@/lib/airtableCharts';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// ⬇️ Importamos el componente funcional que sí usa estado
const UsuariosContent = dynamic(() => import('./UsuariosContent'));

export const metadata: Metadata = {
  title: 'Usuarios | Maity',
};

export default async function Usuarios() {
  const user = await getUser();
  if (!user) redirect('/auth/login');

  const grades = await getGradesArray();
  const deliveriesRaw = await getDeliveries();
  const usersData = await getUsersPerformance();

  return (
    <UsuariosContent
      inter={inter}
      grades={grades}
      deliveriesRaw={deliveriesRaw}
      usersData={usersData}
    />
  );
}
