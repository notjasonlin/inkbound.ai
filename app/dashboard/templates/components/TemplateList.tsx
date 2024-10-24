import { TemplateData } from '@/types/template';
import TemplateItem from './TemplateItem';

export default function TemplateList({ templates }: { templates: TemplateData[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // 3 items per row
        gap: "20px", // Space between items
        padding: "20px"
      }}
    >
      {
        templates.length === 0 ? (
          <p>You haven't created any templates yet.</p>
        ) : (
          templates.map((template) => (
            <TemplateItem key={template.id} template={template} />
          ))
        )
      }
    </div>
  );
}
