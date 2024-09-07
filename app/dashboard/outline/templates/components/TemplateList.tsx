import TemplateItem from './TemplateItem';

interface Template {
  id: string;
  title: string;
  updated_at: string;
}

export default function TemplateList({ templates }: { templates: Template[] }) {
  return (
    <div>
      {templates.length === 0 ? (
        <p>You haven't created any templates yet.</p>
      ) : (
        templates.map((template) => (
          <TemplateItem key={template.id} template={template} />
        ))
      )}
    </div>
  );
}
