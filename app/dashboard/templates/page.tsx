import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import TemplateList from './components/TemplateList';
import TemplateAdd from './components/AddTemplateButton';
import Link from "next/link";
import AddTemplateButton from "./components/AddTemplateButton";

export default async function TemplatesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log("USER", user);

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Templates</h1>
      <AddTemplateButton />
      <div className="mt-8">
        <TemplateList templates={templates || []} />
      </div>
    </div>
  );
}
