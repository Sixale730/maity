import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Target, Calendar, Award, ArrowRight, Star, Quote } from "lucide-react";
import MaityLogo from "@/components/MaityLogo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[guard] session?", !!session);

        if (!session) {
          // Si aqui quieres, navega a /auth. Si ya estas en /auth, no hagas nada.
          return;
        }

        const { data, error } = await supabase.rpc("my_status");
        if (error) {
          console.error("[guard] my_status error:", error);
          return;
        }

        const raw =
          typeof data === "string"
            ? data
            : (data as any)?.status ??
              (Array.isArray(data) ? (data[0] as any)?.status : undefined);

        const status = String(raw || "").toUpperCase();
        console.log("[guard] status =", status, "data =", data);

        if (cancelled) return;

        if (status === "ACTIVE") {
          if (location.pathname !== "/dashboard") {
            navigate("/dashboard", { replace: true });
          }
        } else {
          console.warn("[guard] status inesperado:", status);
        }
      } catch (err) {
        console.error("[guard] error general:", err);
      }
    };

    checkAuthStatus();
    return () => { cancelled = true; };
  }, [navigate]);

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
              <Button variant="ghost" className="font-inter">{t('nav.features')}</Button>
              <Button variant="ghost" className="font-inter">{t('nav.success_cases')}</Button>
              <LanguageSelector />
              <Button variant="outline" className="font-inter" asChild>
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
              <Button className="font-inter" asChild>
                <Link to="/auth">{t('nav.start_free')}</Link>
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
              {t('hero.badge')}
            </Badge>
            <h1 className="font-geist font-bold text-4xl lg:text-6xl text-foreground mb-6 leading-tight">
              <MaityLogo variant="full" size="xl" className="inline-block mr-2" /> {t('hero.title_part1')}{" "}
              <span className="text-primary">{t('hero.title_part2')}</span>
            </h1>
            <p className="font-inter text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-inter text-lg px-8" asChild>
                <Link to="/auth">
                  {t('hero.start_evolution')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="font-inter text-lg px-8">
                {t('hero.watch_demo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-geist font-bold text-3xl lg:text-4xl text-foreground mb-4 flex items-center justify-center gap-2">
              <span>{t('features.title')}</span>
              <MaityLogo variant="full" size="sm" />
              <span>?</span>
            </h2>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: t('features.dashboard.title'),
                description: t('features.dashboard.description')
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: t('features.workplan.title'),
                description: t('features.workplan.description')
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: t('features.achievements.title'),
                description: t('features.achievements.description')
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: t('features.calendar.title'),
                description: t('features.calendar.description')
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
                {t('benefits.title')}
              </h2>
              <p className="font-inter text-lg text-muted-foreground mb-8">
                <MaityLogo variant="symbol" size="sm" className="inline-block mr-1" /> {t('benefits.description')}
              </p>
              
              <div className="space-y-6">
                {[
                  t('benefits.mentoring'),
                  t('benefits.integration'),
                  t('benefits.automation'),
                  t('benefits.metrics')
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
                  {t('benefits.humanity.title')}
                </h3>
                <p className="font-inter text-muted-foreground">
                  {t('benefits.humanity.description')}
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
              {t('testimonials.title')}
            </h2>
            <p className="font-inter text-lg text-muted-foreground">
              {t('testimonials.subtitle')} <MaityLogo variant="symbol" size="sm" className="inline-block" />
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Mendoza",
                role: "CTO, TechStart",
                content: t('testimonials.carlos.content'),
                rating: 5
              },
              {
                name: "Ana García",
                role: "Lead Developer, InnovateLab",
                content: t('testimonials.ana.content'),
                rating: 5
              },
              {
                name: "Roberto Silva",
                role: "Engineering Manager, DataFlow",
                content: t('testimonials.roberto.content'),
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
              {t('cta.title')}
            </h2>
            <p className="font-inter text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-inter text-lg px-8" asChild>
                <Link to="/auth">
                  {t('cta.start_trial')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-inter text-lg px-8">
                {t('cta.schedule_demo')}
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
              © 2024 <MaityLogo variant="symbol" size="sm" className="inline-block mx-1" />. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;




