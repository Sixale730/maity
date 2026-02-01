import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Calendar, Mail, MapPin, ArrowLeft, Clock, Check } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

interface TeamMember {
  name: string;
  role: string;
  company: string;
  description: string;
  linkedin: string;
  initials: string;
  accent: string;
  tags: string[];
  photo: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Poncho Robles',
    role: 'CEO & Fundador',
    company: 'Maity',
    description: 'Lidera la vision de Maity para transformar la comunicacion profesional con IA.',
    linkedin: 'https://www.linkedin.com/in/ponchorobles/',
    initials: 'PR',
    accent: LANDING_COLORS.maityPink,
    tags: ['Ventas', 'Comunicacion', 'Liderazgo'],
    photo: '/lovable-uploads/CEO.png',
  },
  {
    name: 'Julio Gonzalez',
    role: 'CTO',
    company: 'Maity',
    description: 'Arquitecto de la plataforma de IA que impulsa el feedback en tiempo real de Maity.',
    linkedin: 'https://www.linkedin.com/in/julioalexisgonzalezvilla/',
    initials: 'JG',
    accent: LANDING_COLORS.maityBlue,
    tags: ['Tecnologia', 'IA', 'Data Science'],
    photo: '/lovable-uploads/CTO.png',
  },
  {
    name: 'Karina Barrera',
    role: 'Aliada Estrategica \u00b7 CEO',
    company: 'Asertio Capacitacion',
    description: 'Experta en desarrollo organizacional y capacitacion de equipos de alto rendimiento.',
    linkedin: 'https://www.linkedin.com/in/karinabarreragoytia/',
    initials: 'KB',
    accent: LANDING_COLORS.maityGreen,
    tags: ['Capacitacion', 'Equipos', 'Estrategia'],
    photo: '/lovable-uploads/CFO.png',
  },
];

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

const CONTACTS = [
  { icon: Mail, label: 'Email', value: 'hola@maity.com.mx', href: 'mailto:hola@maity.com.mx' },
  { icon: Linkedin, label: 'LinkedIn', value: 'MAITY Inteligencia Artificial', href: 'https://www.linkedin.com/company/maity-ai' },
  { icon: MapPin, label: 'Ubicacion', value: 'Guadalajara, JAL \u00b7 Mexico', href: null },
];

type BookingStep = 'calendar' | 'details' | 'confirmed';

export const DemoCalendarPage = () => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('calendar');
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = now.toLocaleString('es-MX', { month: 'long', year: 'numeric' });

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBooking = () => {
    if (formData.name && formData.email) {
      setBookingStep('confirmed');
    }
  };

  return (
    <section className="pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm hover:text-white transition-colors" style={{ color: LANDING_COLORS.textMuted }}>
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
            Conoce al equipo
          </h1>
          <p className="text-lg mb-12 max-w-2xl" style={{ color: LANDING_COLORS.textMuted }}>
            Agenda una llamada con nuestro equipo. Te ayudamos a entender como Maity puede transformar la comunicacion de tu organizacion.
          </p>
        </FadeIn>

        {/* Team cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {TEAM.map((member, i) => (
            <FadeIn key={member.name} delay={i * 100}>
              <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                <div className="h-1" style={{ backgroundColor: member.accent, boxShadow: `0 0 20px ${member.accent}40` }} />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center text-lg font-bold" style={{ borderColor: member.accent, backgroundColor: `${member.accent}20`, color: member.accent }}>
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.textContent = member.initials; }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: LANDING_COLORS.textMain }}>{member.name}</h3>
                      <p className="text-sm" style={{ color: member.accent }}>{member.role}</p>
                      <p className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>{member.company}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: LANDING_COLORS.textMuted }}>{member.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full border border-white/10" style={{ color: LANDING_COLORS.textMuted }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors" style={{ color: LANDING_COLORS.textMain }}>
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                    <button onClick={scrollToCalendar} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: member.accent }}>
                      <Calendar className="w-4 h-4" /> Agendar
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Contact methods */}
        <FadeIn>
          <div className="grid md:grid-cols-3 gap-4 mb-16">
            {CONTACTS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${LANDING_COLORS.maityPink}15` }}>
                  <Icon className="w-5 h-5" style={{ color: LANDING_COLORS.maityPink }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>{label}</p>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: LANDING_COLORS.textMain }}>{value}</a>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: LANDING_COLORS.textMain }}>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Booking calendar */}
        <div ref={calendarRef}>
          <FadeIn>
            <div className="rounded-2xl border border-white/10 p-6 md:p-8" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: LANDING_COLORS.textMain }}>
                <Calendar className="w-6 h-6 inline-block mr-2" style={{ color: LANDING_COLORS.maityPink }} />
                Agenda tu llamada
              </h2>

              {bookingStep === 'confirmed' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${LANDING_COLORS.maityGreen}20` }}>
                    <Check className="w-8 h-8" style={{ color: LANDING_COLORS.maityGreen }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: LANDING_COLORS.textMain }}>Reserva confirmada</h3>
                  <p className="text-sm mb-1" style={{ color: LANDING_COLORS.textMuted }}>Te enviamos un correo a <strong style={{ color: LANDING_COLORS.textMain }}>{formData.email}</strong></p>
                  <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>Dia {selectedDate} de {monthName} a las {selectedTime}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Date picker */}
                  <div>
                    <p className="text-sm font-medium mb-3 capitalize" style={{ color: LANDING_COLORS.textMain }}>{monthName}</p>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1" style={{ color: LANDING_COLORS.textMuted }}>
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <span key={d} className="py-1">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDay }).map((_, i) => <span key={`e-${i}`} />)}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const isPast = day < now.getDate();
                        const isWeekend = (new Date(year, month, day).getDay() % 6) === 0;
                        const disabled = isPast || isWeekend;
                        const active = selectedDate === day;
                        return (
                          <button
                            key={day}
                            disabled={disabled}
                            onClick={() => { setSelectedDate(day); setSelectedTime(null); setBookingStep('calendar'); }}
                            className={`py-2 rounded-lg text-sm transition-colors ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'} ${active ? 'ring-2 font-bold' : ''}`}
                            style={{ color: LANDING_COLORS.textMain, ...(active ? { backgroundColor: `${LANDING_COLORS.maityPink}30`, ringColor: LANDING_COLORS.maityPink } : {}) }}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots + form */}
                  <div>
                    {!selectedDate ? (
                      <p className="text-sm py-8 text-center" style={{ color: LANDING_COLORS.textMuted }}>Selecciona un dia para ver horarios disponibles</p>
                    ) : bookingStep === 'calendar' ? (
                      <>
                        <p className="text-sm font-medium mb-3" style={{ color: LANDING_COLORS.textMain }}>
                          <Clock className="w-4 h-4 inline mr-1" /> Horarios disponibles
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOTS.map(slot => (
                            <button
                              key={slot}
                              onClick={() => { setSelectedTime(slot); setBookingStep('details'); }}
                              className={`py-2 px-3 rounded-lg text-sm border transition-colors hover:border-white/30 ${selectedTime === slot ? 'font-bold' : ''}`}
                              style={{ borderColor: selectedTime === slot ? LANDING_COLORS.maityPink : 'rgba(255,255,255,0.1)', color: LANDING_COLORS.textMain }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium mb-1" style={{ color: LANDING_COLORS.textMain }}>Dia {selectedDate} a las {selectedTime}</p>
                        <button onClick={() => setBookingStep('calendar')} className="text-xs mb-4 underline" style={{ color: LANDING_COLORS.maityPink }}>Cambiar</button>
                        <div className="space-y-3">
                          <input type="text" placeholder="Nombre completo" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm outline-none focus:border-white/30" style={{ color: LANDING_COLORS.textMain }} />
                          <input type="email" placeholder="Email corporativo" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm outline-none focus:border-white/30" style={{ color: LANDING_COLORS.textMain }} />
                          <input type="text" placeholder="Empresa (opcional)" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm outline-none focus:border-white/30" style={{ color: LANDING_COLORS.textMain }} />
                          <button onClick={handleBooking} disabled={!formData.name || !formData.email} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: LANDING_COLORS.maityPink }}>
                            Confirmar reserva
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
