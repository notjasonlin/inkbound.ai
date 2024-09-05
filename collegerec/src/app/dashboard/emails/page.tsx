"use client";

import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface Email {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
}

export default function Emails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState('');
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmails = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    try {
      const query = 'bcc:collegeathletes9@gmail.com';
      console.log('Fetching emails with query:', query);
      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched email data:', data);
      
      if (!data.messages || data.messages.length === 0) {
        console.log('No emails found matching the criteria');
        setEmails([]);
        return;
      }

      const emailPromises = data.messages.map(async (message: { id: string }) => {
        const emailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const emailData = await emailResponse.json();
        return {
          id: emailData.id,
          snippet: emailData.snippet,
          subject: emailData.payload.headers.find((header: { name: string }) => header.name === 'Subject')?.value || 'No Subject',
          from: emailData.payload.headers.find((header: { name: string }) => header.name === 'From')?.value || 'Unknown Sender',
          to: emailData.payload.headers.find((header: { name: string }) => header.name === 'To')?.value || 'Unknown Recipient',
        };
      });

      const emailDetails = await Promise.all(emailPromises);
      setEmails(emailDetails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    setApiKey(process.env.NEXT_PUBLIC_TINYMCE_API_KEY);
  }, []);

  const handleSendClick = () => {
    setIsModalOpen(true);
    setSubject('');
    setTo('');
    setEmailContent('');
  };

  const handleReplyClick = (email: Email) => {
    setIsModalOpen(true);
    setTo(email.from);
    setSubject(`Re: ${email.subject}`);
    setEmailContent('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmailContent('');
    setSubject('');
    setTo('');
  };

  const handleSendEmail = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    if (!to || !subject || !emailContent) {
      console.error('Missing required fields');
      return;
    }

    const boundary = 'foo_bar_baz';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    let emailBody = 
      "Content-Type: multipart/mixed; boundary=" + boundary + "\r\n" +
      "MIME-Version: 1.0\r\n" +
      "To: " + to + "\r\n" +
      "Subject: " + subject + "\r\n" +
      "Bcc: collegeathletes9@gmail.com\r\n\r\n" +  // Add this line for BCC

      delimiter +
      "Content-Type: text/html; charset=utf-8\r\n\r\n" +
      emailContent + "\r\n\r\n";

    emailBody += closeDelimiter;

    const email = btoa(emailBody).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: email }),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
      }

      console.log('Email sent successfully');
      setIsModalOpen(false);
      setEmailContent('');
      setSubject('');
      setTo('');

      // Refresh the email list
      fetchEmails();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  if (loading) {
    return <div>Loading emails...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={handleSendClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Compose Email
        </button>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Compose Email</h2>
            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full mb-2 p-2 border rounded text-black"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mb-2 p-2 border rounded text-black"
            />
            {apiKey && (
              <Editor
                apiKey={apiKey}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help',
                  content_style: `
                    body { 
                      color: black; 
                      font-family: Arial, sans-serif; 
                      font-size: 14px; 
                    }
                    p { margin: 0; padding: 0 0 10px 0; }
                  `
                }}
                value={emailContent}
                onEditorChange={(content) => setEmailContent(content)}
              />
            )}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-4">Emails Sent by You via Gmail</h2>
      {loading ? (
        <div>Loading emails...</div>
      ) : emails.length === 0 ? (
        <p>No emails found sent by you via Gmail.</p>
      ) : (
        <ul>
          {emails.map((email) => (
            <li key={email.id} className="mb-4 p-4 border rounded">
              <h2 className="font-bold">{email.subject}</h2>
              <p className="text-sm text-gray-600">To: {email.to}</p>
              <p className="mt-2">{email.snippet}</p>
              <button
                onClick={() => handleReplyClick(email)}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Reply
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
