import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface SendEmailModalProps {
    closeModal: () => void,
    initCont: string,
    initSubj: string,
    initTo: string,
    apiKey: string,
    fetchEmails: () => void,
}

const SendEmailModal = ({ closeModal, initCont, initSubj, initTo, apiKey, fetchEmails}: SendEmailModalProps) => {
    const [emailContent, setEmailContent] = useState(initCont);
    const [subject, setSubject] = useState(initSubj);
    const [to, setTo] = useState(initTo);

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
          setEmailContent('');
          setSubject('');
          setTo('');
    
          // Refresh the email list
          fetchEmails();
          handleCloseModal();
        } catch (error) {
          console.error('Error sending email:', error);
        }
      };

      const handleCloseModal = () => {
        setEmailContent("");
        setSubject("");
        setTo("");
        closeModal();
      }
   
    return (
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
    );

}

export default SendEmailModal;