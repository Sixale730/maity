import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Users, Target, Calendar, Award, ArrowRight, Star, Quote, Globe } from "lucide-react";
import MaityLogo from "@/components/MaityLogo";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MaityLogo variant="full" size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="font-inter">Características</Button>
              <Button variant="ghost" className="font-inter">Casos de Éxito</Button>
              <Select defaultValue="es">
                <SelectTrigger className="w-[100px] h-9 font-inter">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">ES</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="font-inter" asChild>
                <Link to="/auth">Iniciar Sesión</Link>
              </Button>
              <Button className="font-inter" asChild>
                <Link to="/auth">Empezar Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 font-inter">
              IA · Mentoría · Crecimiento Diario
            </Badge>
            <h1 className="font-geist font-bold text-4xl lg:text-6xl text-foreground mb-6 leading-tight">
              <MaityLogo variant="symbol" size="xl" className="inline-block mr-2" /> no te entrena para un curso.{" "}
              <span className="text-primary">Te transforma para siempre.</span>
            </h1>
            <p className="font-inter text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tu mentora de inteligencia artificial que impulsa la evolución y el crecimiento diario 
              de equipos en el sector de TI. Una experiencia retadora, emocionalmente inteligente y visionaria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-inter text-lg px-8" asChild>
                <Link to="/auth">
                  Comenzar tu Evolución
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="font-inter text-lg px-8">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-geist font-bold text-3xl lg:text-4xl text-foreground mb-4">
              ¿Cómo funciona <MaityLogo variant="symbol" size="sm" className="inline-block" />?
            </h2>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa que combina inteligencia artificial, gamificación y 
              mentoría personalizada para acelerar el crecimiento de tu equipo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Dashboard Personalizado",
                description: "Visualiza métricas de progreso, sesiones completadas y racha de días activos en tiempo real."
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Plan de Trabajo Visual",
                description: "Rutas de aprendizaje personalizadas con módulos y objetivos claros en formato interactivo."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Sistema de Logros",
                description: "Insignias, XP y leaderboards que motivan la constancia y celebran cada hito alcanzado."
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Calendario Inteligente",
                description: "Sesiones de mentoría sincronizadas con Google Calendar y Outlook para una organización perfecta."
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-geist text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-inter">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-geist font-bold text-3xl lg:text-4xl text-foreground mb-6">
                Más que una herramienta, un compañero de crecimiento
              </h2>
              <p className="font-inter text-lg text-muted-foreground mb-8">
                <MaityLogo variant="symbol" size="sm" className="inline-block mr-1" /> no es solo tecnología. Es una experiencia diseñada para crear conexiones 
                humanas auténticas mientras potencia el desarrollo profesional de cada miembro de tu equipo.
              </p>
              
              <div className="space-y-6">
                {[
                  "Mentoría personalizada basada en IA avanzada",
                  "Integración perfecta con herramientas existentes",
                  "Automatización inteligente de flujos de trabajo",
                  "Métricas claras de progreso y ROI"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="font-inter text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="font-geist font-semibold text-2xl text-foreground mb-4">
                  Humanidad Aumentada
                </h3>
                <p className="font-inter text-muted-foreground">
                  Tecnología que potencia la conexión humana, no que la reemplaza. 
                  Cada interacción está diseñada para ser auténtica, retadora y transformadora.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-geist font-bold text-3xl lg:text-4xl text-foreground mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="font-inter text-lg text-muted-foreground">
              Líderes de TI que ya están transformando sus equipos con <MaityLogo variant="symbol" size="sm" className="inline-block" />
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Mendoza",
                role: "CTO, TechStart",
                content: "La plataforma ha revolucionado cómo desarrollamos talento en nuestro equipo. Los resultados son medibles y el engagement ha aumentado un 300%.",
                rating: 5
              },
              {
                name: "Ana García",
                role: "Lead Developer, InnovateLab",
                content: "La gamificación realmente funciona. Nuestros desarrolladores están más motivados y las habilidades blandas han mejorado significativamente.",
                rating: 5
              },
              {
                name: "Roberto Silva",
                role: "Engineering Manager, DataFlow",
                content: "La automatización de la plataforma nos ahorra 10 horas semanales en gestión de equipo, permitiéndonos enfocarnos en lo que realmente importa.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <Quote className="h-8 w-8 text-primary/30 mb-2" />
                  <CardDescription className="font-inter text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-geist text-lg">{testimonial.name}</CardTitle>
                      <p className="font-inter text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-card to-muted rounded-2xl p-12 lg:p-16 text-center border border-border">
            <h2 className="font-geist font-bold text-3xl lg:text-4xl text-foreground mb-4">
              ¿Listo para transformar tu equipo?
            </h2>
            <p className="font-inter text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a cientos de líderes de TI que ya están viendo resultados reales. 
              Comienza tu prueba gratuita hoy y descubre el potencial de tu equipo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-inter text-lg px-8" asChild>
                <Link to="/auth">
                  Iniciar Prueba Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-inter text-lg px-8">
                Agendar Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <MaityLogo variant="full" size="md" />
            <p className="font-inter text-muted-foreground text-center md:text-right">
              © 2024 <MaityLogo variant="symbol" size="sm" className="inline-block mx-1" />. Transformando el futuro del aprendizaje en TI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;