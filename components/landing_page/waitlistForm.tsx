'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const WaitlistForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page refresh on form submission
    setLoading(true);
    const supabase = createClientComponentClient(); // Create Supabase client

    try {
      // Check if the email is already in the waitlist
      const { data: existingUser, error: checkError } = await supabase
        .from('waiting_list')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        // If the email is already on the waitlist, show the specific message
        setMessage('You are already on the waiting list.');
        setLoading(false);
        return;
      }

      // If the email is not found, insert the full name and email
      if (checkError && checkError.code === 'PGRST116') {
        const { data, error } = await supabase
          .from('waiting_list')
          .insert([{ fullName: fullName, email }]);

        if (error) {
          console.error('Error adding to waitlist:', error.message);
          setMessage('There was an error. Please try again later.');
        } else {
          setMessage('Thank you for joining the waitlist!');
          setFullName('');
          setEmail('');
        }
      } else if (checkError) {
        // Handle unexpected errors
        console.error('Unexpected error checking for existing email:', checkError.message);
        setMessage('An unexpected error occurred. Please try again later.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {/* Waitlist Form */}
      <div className="mt-6">
        <form className="bg-white p-6 shadow-lg rounded-lg max-w-md mx-auto" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Sign up for the Waitlist</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)} // Update state
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update state
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300 w-full"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {/* Display success or error message */}
        {message && <p className="mt-4 text-blue-700 font-bold">{message}</p>}
      </div>
    </div>
  );
};

export default WaitlistForm;
