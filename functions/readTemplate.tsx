import { SchoolData } from "@/types/school";
import { TemplateData } from "@/types/template";

const COACH = '[coachLastName]';
const SCHOOL = '[schoolName]';

export default function readTemplate(template: TemplateData, school?: SchoolData) {
    let content = template.content.content;

    if (content) {
        const placeholders: string[] = [COACH, SCHOOL];
        let replacements: string[];
        if (school && school.coaches && school.coaches.length > 0) {
            const coachFullName = school.coaches[0].name;
            const coachLastName = coachFullName.split(' ').pop() || '';
            replacements = [`Coach ${coachLastName}`, school.school];
        } else {
            replacements = ["Coach [BLANK]", "[BLANK] University"];
        }

        placeholders.forEach((placeholder, index) => {
            content = content.replaceAll(placeholder, replacements[index]);
        });
        
        return content;
    }
}
