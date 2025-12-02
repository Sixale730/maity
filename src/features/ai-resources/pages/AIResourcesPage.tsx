import {
  Brain,
  Sparkles,
  BookOpen,
  ExternalLink,
  Lightbulb,
  GraduationCap,
  Video,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { SidebarTrigger } from "@/ui/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAIResources, type AIResource } from "@maity/shared";
import { AddResourceDialog } from "../components/AddResourceDialog";

// Map icon string names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  brain: Brain,
  sparkles: Sparkles,
  "book-open": BookOpen,
  lightbulb: Lightbulb,
  "graduation-cap": GraduationCap,
  video: Video,
  "file-text": FileText,
};

// Map color names to Tailwind classes
const COLOR_MAP: Record<string, { gradient: string; border: string; text: string }> = {
  purple: {
    gradient: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    text: "text-purple-900",
  },
  pink: {
    gradient: "from-pink-50 to-pink-100",
    border: "border-pink-200",
    text: "text-pink-900",
  },
  cyan: {
    gradient: "from-cyan-50 to-cyan-100",
    border: "border-cyan-200",
    text: "text-cyan-900",
  },
  blue: {
    gradient: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    text: "text-blue-900",
  },
  green: {
    gradient: "from-green-50 to-green-100",
    border: "border-green-200",
    text: "text-green-900",
  },
  orange: {
    gradient: "from-orange-50 to-orange-100",
    border: "border-orange-200",
    text: "text-orange-900",
  },
  slate: {
    gradient: "from-slate-50 to-slate-100",
    border: "border-slate-200",
    text: "text-slate-900",
  },
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Brain;
}

function getColorClasses(colorName: string) {
  return COLOR_MAP[colorName] || COLOR_MAP.purple;
}

export function AIResourcesPage() {
  const { t } = useLanguage();
  const { data: resources, isLoading, error } = useAIResources();

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-8 h-8" />
              {t("ai_resources.title")}
            </h1>
            <p className="text-muted-foreground">{t("ai_resources.description")}</p>
          </div>
        </div>
        <AddResourceDialog />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t("ai_resources.loading")}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">{t("ai_resources.error")}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && resources?.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t("ai_resources.empty")}</p>
        </div>
      )}

      {/* Resource Cards Grid */}
      {resources && resources.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource: AIResource) => {
            const IconComponent = getIconComponent(resource.icon);
            const colors = getColorClasses(resource.color);

            return (
              <Card
                key={resource.id}
                className={`bg-gradient-to-br ${colors.gradient} ${colors.border} hover:shadow-lg transition-shadow duration-200`}
              >
                <CardHeader>
                  <IconComponent className={`h-10 w-10 mb-2 ${colors.text}`} />
                  <CardTitle className={colors.text}>{resource.title}</CardTitle>
                  <CardDescription className={`${colors.text} opacity-70`}>
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 ${colors.text} font-medium hover:underline`}
                  >
                    {t("ai_resources.open_resource")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
