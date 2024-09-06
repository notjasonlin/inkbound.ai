export interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export interface EmailListProps {
  emails: Email[];
}

export interface EmailItemProps {
  email: Email;
}

export interface UseEmailsResult {
  emails: Email[];
  loading: boolean;
  error: string | null;
}
