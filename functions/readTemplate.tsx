import { SchoolData } from "@/types/school";
import { TemplateData } from "@/types/template";
import { PersonalizedMessage } from "@/types/personalized_messages";

const COACH = '[coachLastName]';
const SCHOOL = '[schoolName]';
const PERSONALIZED = '[personalizedMessage]';

export default function readTemplate(
    template: TemplateData, 
    school?: SchoolData,
    personalizedMessages?: { [key: string]: PersonalizedMessage }
) {
    let content = template.content.content;

    if (content) {
        // Handle coach and school name replacements
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

        // Handle personalized message replacement
        if (school && personalizedMessages && personalizedMessages[school.id]) {
            const pMessage = personalizedMessages[school.id];
            if (pMessage.message) {
                content = content.replaceAll(PERSONALIZED, pMessage.message);
            } else {
                content = content.replaceAll(PERSONALIZED, ''); // Remove placeholder if no message
            }
        } else {
            content = content.replaceAll(PERSONALIZED, ''); // Remove placeholder if no personalized message data
        }
        
        return content;
    }
}
