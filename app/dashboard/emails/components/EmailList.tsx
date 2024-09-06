import { useState } from 'react';
import { EmailListProps } from '@/types/index';
import EmailItem from './EmailItem';

export default function EmailList({ emails }: EmailListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const paginatedEmails = emails.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedEmails.map((email) => (
            <EmailItem key={email.id} email={email} />
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center p-4">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page * pageSize >= emails.length}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
