export interface TemplateContent {
    content: string;
    title: string;
  }
  
  export interface Template {
    id: string;
    name: string;
    content: TemplateContent;
  }