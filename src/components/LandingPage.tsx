import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Badge } from "@/ui/components/ui/badge";
import { CheckCircle, Users, Target, Calendar, Award, ArrowRight, Star, Quote, Menu, X } from "lucide-react";
import MaityLogo from "@/shared/components/MaityLogo";
import LanguageSelector from "@/shared/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase, AuthService } from "@maity/shared";

const LandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        const data = await AuthService.getMyStatus();

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
              <MaityLogo variant="full" size="sm" className="sm:hidden" />
              <MaityLogo variant="full" size="md" className="hidden sm:block" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" className="font-inter text-sm lg:text-base">{t('nav.features')}</Button>
              <Button variant="ghost" className="font-inter text-sm lg:text-base">{t('nav.success_cases')}</Button>
              <LanguageSelector />
              <Button variant="outline" className="font-inter text-sm lg:text-base" asChild>
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSelector />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start font-inter">
                {t('nav.features')}
              </Button>
              <Button variant="ghost" className="w-full justify-start font-inter">
                {t('nav.success_cases')}
              </Button>
              <Button variant="outline" className="w-full font-inter" asChild>
                <Link to="/auth">{t('nav.login')}</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 sm:mb-6 font-inter text-xs sm:text-sm">
              {t('hero.badge')}
            </Badge>
            <h1 className="font-geist font-bold text-3xl sm:text-4xl lg:text-6xl text-foreground mb-4 sm:mb-6 leading-tight">
              <MaityLogo variant="full" size="md" className="inline-block align-middle mr-1 sm:mr-2 sm:hidden scale-[0.85]" />
              <MaityLogo variant="full" size="lg" className="hidden sm:inline-block sm:align-middle lg:hidden mr-2 scale-[0.85]" />
              <MaityLogo variant="full" size="xl" className="hidden lg:inline-block lg:align-middle mr-2 scale-[0.85]" />
              {" "}{t('hero.title_part1')}{" "}
              <span className="text-primary">{t('hero.title_part2')}</span>
            </h1>
            <p className="font-inter text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button size="lg" className="font-inter text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto" asChild>
                <Link to="/auth">
                  {t('hero.start_evolution')}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="font-inter text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                {t('hero.watch_demo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="font-geist font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-3 sm:mb-4 flex items-center justify-center gap-2 flex-wrap">
              <span>{t('features.title')}</span>
              <MaityLogo variant="full" size="sm" className="align-middle" />
              <span>?</span>
            </h2>
            <p className="font-inter text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {t('features.description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                <CardHeader className="p-4 sm:p-6">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3 sm:mb-4">
                    <div className="scale-75 sm:scale-100">{feature.icon}</div>
                  </div>
                  <CardTitle className="font-geist text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <CardDescription className="font-inter text-sm sm:text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-geist font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-4 sm:mb-6">
                {t('benefits.title')}
              </h2>
              <p className="font-inter text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                <MaityLogo variant="symbol" size="sm" className="inline-block align-middle mr-1" /> {t('benefits.description')}
              </p>

              <div className="space-y-4 sm:space-y-6">
                {[
                  t('benefits.mentoring'),
                  t('benefits.integration'),
                  t('benefits.automation'),
                  t('benefits.metrics')
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start sm:items-center space-x-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="font-inter text-sm sm:text-base text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 sm:p-8 lg:p-12">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                </div>
                <h3 className="font-geist font-semibold text-xl sm:text-2xl text-foreground mb-3 sm:mb-4">
                  {t('benefits.humanity.title')}
                </h3>
                <p className="font-inter text-sm sm:text-base text-muted-foreground">
                  {t('benefits.humanity.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="font-geist font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-3 sm:mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="font-inter text-base sm:text-lg text-muted-foreground px-4">
              {t('testimonials.subtitle')} <MaityLogo variant="symbol" size="sm" className="inline-block align-middle" />
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                <CardHeader className="p-4 sm:p-6">
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary/30 mb-2" />
                  <CardDescription className="font-inter text-sm sm:text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="font-geist text-base sm:text-lg">{testimonial.name}</CardTitle>
                      <p className="font-inter text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-primary text-primary" />
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
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-card to-muted rounded-2xl p-6 sm:p-8 lg:p-12 xl:p-16 text-center border border-border">
            <h2 className="font-geist font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground mb-3 sm:mb-4">
              {t('cta.title')}
            </h2>
            <p className="font-inter text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
              <Button size="lg" className="font-inter text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto" asChild>
                <Link to="/auth">
                  {t('cta.start_trial')}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-inter text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                {t('cta.schedule_demo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <MaityLogo variant="full" size="sm" className="sm:hidden" />
            <MaityLogo variant="full" size="md" className="hidden sm:block" />
            <p className="font-inter text-sm sm:text-base text-muted-foreground text-center md:text-right">
              © 2024 <MaityLogo variant="symbol" size="sm" className="inline-block align-middle mx-1" />. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;




