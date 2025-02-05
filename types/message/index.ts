export interface Message {
    id: string;
    content: string;
    from: string;
    date: string;
    isCoachMessage: boolean;
    threadId: string;
    messageNum: number;
    classification: number | null;
  }