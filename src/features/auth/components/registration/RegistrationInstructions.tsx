import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';
import { MessageCircle, Target, Sparkles } from 'lucide-react';

interface RegistrationInstructionsProps {
  onStart: () => void;
}

export function RegistrationInstructions({ onStart }: RegistrationInstructionsProps) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Autoevaluación Maity: Descubre tu estilo de comunicación
        </h1>
        <div className="space-y-1">
          <p className="text-base sm:text-lg text-muted-foreground">
            Explora cómo te expresas, conectas e inspiras a los demás.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground">
            En solo 1 minuto, obtendrás un mapa visual de tus fortalezas y oportunidades.
          </p>
        </div>
      </div>

      {/* 3 Steps Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Step 1: Introducción */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-base">1. Introducción</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Maity te acompañará a conocer cómo comunicas y qué te hace único al expresarte.
            </p>
          </CardContent>
        </Card>

        {/* Step 2: Evaluación rápida */}
        <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 border-pink-500/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-pink-400" />
              <h3 className="font-semibold text-base">2. Evaluación rápida</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Contesta brevemente sobre cómo hablas, escuchas y conectas.
            </p>
          </CardContent>
        </Card>

        {/* Step 3: Resultados */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-base">3. Resultados</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Descubre tus fortalezas comunicativas y recibe sugerencias personalizadas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Video */}
      <Card className="bg-muted/50">
        <CardContent className="p-0">
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Nf3Y_SEuhbw"
              title="Autoevaluación Maity - Video introductorio"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Text */}
      <div className="text-center space-y-4">
        <p className="text-sm sm:text-base text-muted-foreground">
          Observa cómo tu voz, tus gestos y tus palabras crean impacto. Maity te mostrará cómo comunicar con más claridad, empatía y propósito.
        </p>

        <p className="text-sm font-medium text-foreground">
          Esta autoevaluación dura solo 1 minuto
        </p>

        {/* Start Button */}
        <Button
          onClick={onStart}
          size="lg"
          className="w-full sm:w-auto px-8 bg-[#1bea9a] hover:bg-[#18d18a] text-black font-semibold"
        >
          Comenzar
        </Button>
      </div>
    </div>
  );
}
