# Cambios aplicados en esta conversación a LandingPage.jsx

## 1. Hero Section - Título y Subtítulo
**Ubicación:** Línea ~663-668
**Antes:**
```jsx
<h1 className="text-5xl md:text-7xl font-bold leading-[0.95] mb-8 tracking-tighter text-white font-geist">
    La Mentora IA <br /> que <span ...>te hace imparable.</span>
</h1>
<p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl">
    Ma ity no solo graba reuniones; las convierte en tu laboratorio de crecimiento personal...
</p>
```

**Después:**
```jsx
<h1 className="text-5xl md:text-7xl font-bold leading-[0.95] mb-8 tracking-tighter text-white font-geist">
    Tu coach de soft skills <br /> <span ...>con IA</span>
</h1>
<p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl">
    Transforma conversaciones reales en entrenamiento medible. Mejora comunicación, ventas y liderazgo con gamificación diaria.
</p>
```

## 2. Botones del Hero Section
**Ubicación:** Línea ~670-682
**Antes:**
- Botón primario: "Empezar Evolución"
- Botón secundario: "Ver Demo"

**Después:**
- Botón primario: "Prueba Gratis"
- Botón secundario: "Ver Demo" (sin cambios)

## 3. Sección "Cómo Funciona" - 5 pasos
**Ubicación:** Línea ~728-764
**Antes:** 3 pasos (Configura, Captura, Evoluciona)

**Después:** 5 pasos:
```jsx
[
    {
        icon: <UserCheck size={24} className="text-pink-500" />,
        step: "01",
        title: "Configura tu perfil",
        desc: "Define tu rol y objetivos."
    },
    {
        icon: <Mic size={24} className="text-blue-500" />,
        step: "02",
        title: "Captura conversaciones",
        desc: "Graba reuniones reales."
    },
    {
        icon: <Brain size={24} className="text-purple-500" />,
        step: "03",
        title: "Maity analiza con IA",
        desc: "Recibe feedback inmediato."
    },
    {
        icon: <Trophy size={24} className="text-yellow-500" />,
        step: "04",
        title: "Retos personalizados",
        desc: "Mejora con gamificación."
    },
    {
        icon: <BarChart2 size={24} className="text-green-500" />,
        step: "05",
        title: "Ve tu evolución",
        desc: "Sigue tu progreso en el dashboard."
    }
]
```

Layout cambiado de `grid-cols-3` a `flex-wrap` con `w-full md:w-1/6` por ítem.

## 4. Imports faltantes
**Ubicación:** Línea 12-13
**Agregar:**
```jsx
Linkedin, Instagram, Facebook, Video as YoutubeIcon, Youtube, Calendar,
Download, Monitor, Apple, Smartphone as SmartphoneIcon,
Layout, Scale, Headphones, Smile, Flag
```
