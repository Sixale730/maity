import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useCreateLearningContent } from '@maity/shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/components/ui/form';
import { Input } from '@/ui/components/ui/input';
import { Textarea } from '@/ui/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';

const CONTENT_TYPES = [
  { value: 'video', label: '🎬 Video' },
  { value: 'podcast', label: '🎙️ Podcast' },
  { value: 'pdf', label: '📄 PDF' },
  { value: 'article', label: '📝 Artículo' },
] as const;

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  description: z.string().max(500).optional(),
  url: z.string().url('Debe ser una URL válida'),
  content_type: z.enum(['video', 'podcast', 'pdf', 'article']),
  thumbnail_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  duration: z.string().max(50).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddContentDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const createContent = useCreateLearningContent();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      content_type: 'video',
      thumbnail_url: '',
      duration: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createContent.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        url: data.url,
        content_type: data.content_type,
        thumbnail_url: data.thumbnail_url || undefined,
        duration: data.duration || undefined,
      });

      toast({ title: t('learning_content.success'), variant: 'default' });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating content:', error);
      toast({ title: t('learning_content.error'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-black hover:bg-gray-200">
          <Plus className="h-4 w-4" />
          {t('learning_content.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('learning_content.add_title')}</DialogTitle>
          <DialogDescription>{t('learning_content.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('learning_content.form.title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('learning_content.form.title')} {...field} />
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
                  <FormLabel>{t('learning_content.form.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('learning_content.form.description')}
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
                  <FormLabel>{t('learning_content.form.url')}</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('learning_content.form.type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('learning_content.form.duration')}</FormLabel>
                    <FormControl>
                      <Input placeholder="15 min" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('learning_content.form.thumbnail')}</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('learning_content.form.cancel')}
              </Button>
              <Button type="submit" disabled={createContent.isPending}>
                {createContent.isPending ? '...' : t('learning_content.form.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
