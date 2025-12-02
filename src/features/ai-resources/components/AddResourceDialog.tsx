import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useCreateResource } from "@maity/shared";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/ui/components/ui/use-toast";
import { Button } from "@/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/ui/form";
import { Input } from "@/ui/components/ui/input";
import { Textarea } from "@/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/ui/select";

const AVAILABLE_ICONS = [
  { value: "brain", label: "Cerebro (IA)" },
  { value: "sparkles", label: "Destellos" },
  { value: "book-open", label: "Libro" },
  { value: "lightbulb", label: "Bombilla" },
  { value: "graduation-cap", label: "Graduación" },
  { value: "video", label: "Video" },
  { value: "file-text", label: "Documento" },
];

const AVAILABLE_COLORS = [
  { value: "purple", label: "Morado" },
  { value: "pink", label: "Rosa" },
  { value: "cyan", label: "Cian" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "orange", label: "Naranja" },
  { value: "slate", label: "Gris" },
];

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100),
  description: z.string().max(500).optional(),
  url: z.string().url("Debe ser una URL válida"),
  icon: z.string().default("brain"),
  color: z.string().default("purple"),
});

type FormData = z.infer<typeof formSchema>;

export function AddResourceDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const createResource = useCreateResource();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      icon: "brain",
      color: "purple",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createResource.mutateAsync({
        title: data.title,
        description: data.description || "",
        url: data.url,
        icon: data.icon,
        color: data.color,
      });

      toast({
        title: t("ai_resources.success"),
        variant: "default",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        title: t("ai_resources.error"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("ai_resources.add_resource")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("ai_resources.add_title")}</DialogTitle>
          <DialogDescription>
            {t("ai_resources.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ai_resources.form.title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("ai_resources.form.title_placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ai_resources.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("ai_resources.form.description_placeholder")}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("ai_resources.form.url")}</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("ai_resources.form.url_placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ai_resources.form.icon")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ai_resources.form.color")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABLE_COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full bg-${color.value}-500`}
                                style={{ backgroundColor: getColorHex(color.value) }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("ai_resources.form.cancel")}
              </Button>
              <Button type="submit" disabled={createResource.isPending}>
                {createResource.isPending ? "..." : t("ai_resources.form.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getColorHex(color: string): string {
  const colors: Record<string, string> = {
    purple: "#a855f7",
    pink: "#ec4899",
    cyan: "#06b6d4",
    blue: "#3b82f6",
    green: "#22c55e",
    orange: "#f97316",
    slate: "#64748b",
  };
  return colors[color] || colors.purple;
}
