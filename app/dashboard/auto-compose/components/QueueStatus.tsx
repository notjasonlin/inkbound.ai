import React from 'react';

interface QueueStatusProps {
  status: string[];
}

const QueueStatus: React.FC<QueueStatusProps> = ({ status }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Queue Status</h2>
      <ul className="list-disc pl-5">
        {status.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default QueueStatus;
