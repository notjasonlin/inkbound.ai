import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

interface QueueStatusItem {
  schoolId: string;
  schoolName: string;  // Add this to show school names
  status: 'queued' | 'sending' | 'sent' | 'failed';
  timestamp: string;
}

interface QueueStatusProps {
  status: QueueStatusItem[];
}

const QueueStatus: React.FC<QueueStatusProps> = ({ status }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <FaCheckCircle className="text-green-500" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      case 'sending':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      default:
        return <FaSpinner className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'sending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div id="queue-status" className="mt-6 bg-white shadow-md rounded-lg p-6 max-h-96 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4">Email Queue Status</h2>
      {status.length === 0 ? (
        <p className="text-gray-500">No emails in queue.</p>
      ) : (
        <div className="space-y-4">
          {status.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.status)}
                <span className="font-medium">{item.schoolName}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`${getStatusColor(item.status)} capitalize`}>
                  {item.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Total: {status.length} | 
          Sent: {status.filter(item => item.status === 'sent').length} | 
          Failed: {status.filter(item => item.status === 'failed').length} | 
          Pending: {status.filter(item => ['queued', 'sending'].includes(item.status)).length}
        </p>
      </div>
    </div>
  );
};

export default QueueStatus;
