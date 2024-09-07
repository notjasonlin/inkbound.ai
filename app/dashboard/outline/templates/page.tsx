import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import TemplateList from './components/TemplateList';
import TemplateAdd from './components/TemplateAdd';

export default async function TemplatesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: templates, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    // Handle error appropriately
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">My Templates</h1>
      <TemplateAdd userId={user.id} />
      <TemplateList templates={templates || []} />
    </div>
  );
}
