import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import TemplateEditor from './components/TemplateEditor';
import { useRouter } from "next/navigation";


export default async function TemplatePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const searchParams = new URLSearchParams(window.location.search);
  const uuidParam = searchParams.get("uuid");

  if (!user) {
    return notFound();
  }


  return <TemplateEditor template={data} />;
    

}
