import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MaityLogo from "@/components/MaityLogo";
import { useNavigate } from "react-router-dom";

const Pending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <MaityLogo variant="full" size="md" className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-geist">Estamos activando tu cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground font-inter">
            Nuestro equipo está revisando tu información. Te avisaremos por correo electrónico cuando tu cuenta esté lista.
          </p>
          <Button variant="outline" onClick={() => navigate('/', { replace: true })} className="font-inter">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pending;
