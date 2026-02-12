// =============================================================================
// BLACK STORIES - Mysteries Catalog
// Ported from the original Canva HTML game
// =============================================================================

export type AnswerType = 'yes' | 'no' | 'irrelevant';

export interface Mystery {
  id: string;
  mystery: string;
  solution: string;
  icon: string;
  keywords: {
    yes: string[];
    no: string[];
    hints: string[];
  };
}

export const MYSTERIES: Mystery[] = [
  {
    id: 'parachute',
    mystery: 'Un hombre yace muerto en medio del desierto, con una mochila a su lado. No hay huellas alrededor. ¿Qué pasó?',
    solution: 'El hombre saltó de un avión pero su paracaídas (en la mochila) no se abrió. Por eso cayó en el desierto sin dejar huellas alrededor.',
    icon: '🏜️',
    keywords: {
      yes: ['avión', 'paracaídas', 'caer', 'saltar', 'volar', 'cielo', 'altura', 'caída'],
      no: ['caminar', 'perdido', 'sed', 'mochila vacía', 'robo', 'asesinato'],
      hints: [
        '💡 El hombre venía desde muy arriba',
        '💡 La mochila contenía algo que debió salvarlo',
        '💡 Algo falló en su descenso',
      ],
    },
  },
  {
    id: 'photo',
    mystery: 'Una mujer entra a una habitación, ve algo en la mesa y grita de horror. Luego llama a la policía. ¿Qué vio?',
    solution: 'Vio una foto de ella misma durmiendo, tomada esa misma noche. Alguien entró en su casa sin que ella lo notara.',
    icon: '👀',
    keywords: {
      yes: ['foto', 'imagen', 'ella misma', 'dormir', 'noche', 'intruso', 'casa', 'privacidad'],
      no: ['muerto', 'sangre', 'arma', 'dinero', 'robo'],
      hints: [
        '💡 Lo que vio estaba relacionado con ella misma',
        '💡 Alguien más estuvo en su casa sin permiso',
        '💡 Era evidencia de una invasión reciente',
      ],
    },
  },
  {
    id: 'monopoly',
    mystery: 'Un hombre empuja su auto hasta un hotel y pierde toda su fortuna. ¿Por qué?',
    solution: 'Estaba jugando Monopoly. Empujó su ficha (el auto) hasta una casilla de hotel y tuvo que pagar, perdiendo todo su dinero del juego.',
    icon: '🏨',
    keywords: {
      yes: ['juego', 'monopoly', 'ficha', 'tablero', 'jugar', 'dinero ficticio'],
      no: ['real', 'accidente', 'deuda', 'casino', 'apuesta'],
      hints: [
        '💡 No era un auto real',
        '💡 El hotel tampoco era real',
        '💡 Todo ocurrió en un juego de mesa',
      ],
    },
  },
  {
    id: 'fishbowl',
    mystery: 'Romeo y Julieta yacen muertos en el suelo, rodeados de agua y vidrios rotos. ¿Qué sucedió?',
    solution: 'Romeo y Julieta eran peces. Su pecera se cayó y se rompió, dejándolos sin agua en el suelo.',
    icon: '🐠',
    keywords: {
      yes: ['peces', 'pecera', 'agua', 'caer', 'romper', 'vidrio', 'mascotas'],
      no: ['personas', 'humanos', 'veneno', 'suicidio', 'amor'],
      hints: [
        '💡 Romeo y Julieta no eran humanos',
        '💡 Necesitaban el agua para vivir',
        '💡 Su hogar de vidrio se rompió',
      ],
    },
  },
  {
    id: 'elevator',
    mystery: 'Un hombre vive en el piso 20. Cada día toma el ascensor hasta el piso 15 y sube el resto por escaleras. ¿Por qué?',
    solution: 'El hombre es de baja estatura y no alcanza el botón del piso 20. Solo llega hasta el botón del piso 15.',
    icon: '🏢',
    keywords: {
      yes: ['bajo', 'estatura', 'altura', 'alcanzar', 'botón', 'pequeño', 'no llega'],
      no: ['ejercicio', 'salud', 'miedo', 'claustrofobia', 'roto'],
      hints: [
        '💡 Tiene una limitación física',
        '💡 No puede usar el ascensor completamente',
        '💡 Su problema es con los botones del ascensor',
      ],
    },
  },
];

export function analyzeQuestion(question: string, mystery: Mystery): AnswerType {
  const q = question.toLowerCase();

  for (const kw of mystery.keywords.yes) {
    if (q.includes(kw)) return 'yes';
  }

  for (const kw of mystery.keywords.no) {
    if (q.includes(kw)) return 'no';
  }

  return 'irrelevant';
}
