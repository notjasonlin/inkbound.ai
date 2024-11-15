import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import DynamicTemplateList from './components/DynamicTemplateList';
import AddTemplateButton from "./components/AddTemplateButton";

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
    console.error('Error fetching data:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Templates</h1>
        <AddTemplateButton />
      </div>
      <div className="mt-8">
        <DynamicTemplateList initialTemplates={templates || []} userId={user.id} />
      </div>
    </div>
  );
}
