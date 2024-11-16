import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import TemplateEditor from './components/TemplateEditor';

type TemplatePageProps = {
  params: Promise<{ template: string }>; // CHANGED THIS TO SATISFY NEXT.JS ESLinter
};

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { template } = await params; // Resolve params immediately as a Promise
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const templateTitle = decodeURIComponent(template);

  if (!user) {
    return notFound();
  }

  return (
    <>
      {templateTitle && <TemplateEditor templateTitle={templateTitle} />}
    </>
  );
}
