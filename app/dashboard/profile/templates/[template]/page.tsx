import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation';
import TemplateEditor from './components/TemplateEditor';

export default async function TemplatePage({ params }: { params: { template: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const templateTitle = decodeURIComponent(params.template);

  if (!user) {
    return notFound();
  }


  return (
    <>
      {templateTitle && <TemplateEditor templateTitle={templateTitle} />}
    </>
  );


}
