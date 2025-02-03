'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const LoginForm = dynamic(() => import('./components/LoginForm'), {
  ssr: false,
  loading: () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-gray-600"
    >
      Loading...
    </motion.div>
  ),
});

const LoginPage = () => {
  return (
    <div className="relative flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      {/* Decorative Background Shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute top-10 left-10 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-30"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300 rounded-full filter blur-3xl opacity-30"
      ></motion.div>

      {/* Login Form Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-10 py-14 bg-white shadow-lg rounded-lg border border-gray-200"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
};

export default LoginPage;
