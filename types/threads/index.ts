export interface Email {
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
  }
  
  export interface EmailThread {
    threadId: string;
    messages: Email[];
  }

  export interface useThreadResult {
    threads: EmailThread | null,
    loading: boolean,
    error: string | null,
  }