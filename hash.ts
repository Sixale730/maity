// scripts/hash.ts
import bcrypt from 'bcrypt';

async function generarHash() {
  const contraseña = 'Devops730!'; // 👈 Cambia esta por la contraseña que quieras
  const hash = await bcrypt.hash(contraseña, 12);
  console.log('Hash generado para:', contraseña);
  console.log(hash);
}

generarHash();
