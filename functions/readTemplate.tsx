import { SchoolData } from "@/types/school";
import { TemplateData } from "@/types/template";

const COACH = '<span class=\"bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block\" contenteditable=\"false\" data-placeholder=\"[coachLastName]\">Coach</span>';
const SCHOOL = '<span class=\"bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block\" contenteditable=\"false\" data-placeholder=\"[schoolName]\">School Name</span>';

export default function readTemplate(template: TemplateData, school?: SchoolData) {
    let content = template.content.content;

    if (content) {
        const placeholders: string[] = [COACH, SCHOOL];
        let replacements: string[];
        if (school) {
            replacements = ["Coach " + school.coaches[0].name, school.school]
        } else {
            replacements = ["Coach [BLANK]", "[BLANK] University"]
        }

        let len = placeholders.length;
        for (let i = 0; i < len; i++) {
            content = content.replaceAll(placeholders[i], replacements[i]);
        }
        return content;
    }
}