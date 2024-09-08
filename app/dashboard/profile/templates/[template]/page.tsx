import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import TemplateEditor from './components/TemplateEditor';

export default async function TemplatePage({ params }: { params: { template: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: template, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', params.template)
    .eq('user_id', user.id)
    .single();

  if (error || !template) {
    console.error('Error fetching template:', error);
    return notFound();
  }

  return <TemplateEditor template={template} userId={user.id} />;
}
