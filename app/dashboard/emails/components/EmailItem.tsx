import { EmailItemProps } from '@/types/index';

export default function EmailItem({ email }: EmailItemProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">{email.subject}</td>
      <td className="px-6 py-4 whitespace-nowrap">{email.from}</td>
      <td className="px-6 py-4 whitespace-nowrap">{new Date(email.date).toLocaleString()}</td>
    </tr>
  );
}
