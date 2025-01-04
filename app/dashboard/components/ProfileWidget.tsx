import React from "react";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";

interface ProfileWidgetProps {
  userName: string;
  // Only keep what we actually need
  stats: {
    totalSchools: string;
    profileCompletion: string;
  };
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ userName, stats }) => {
  const completion = parseInt(stats.profileCompletion, 10) || 0;
  const safeCompletion = Math.min(Math.max(completion, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative
        w-full
        bg-white
        rounded-lg
        shadow
        p-4
        md:p-6
        text-gray-700
        flex
        flex-col
        space-y-4
      "
    >
      {/* Profile Heading */}
      <div className="flex items-center space-x-3">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
          <FaUserCircle size={36} />
        </div>
        <div className="flex flex-col">
          <h2 className="font-bold text-lg md:text-xl text-gray-800 leading-tight">
            {userName}
          </h2>
          <span className="text-sm text-gray-500">Welcome back!</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 text-center">
        <div className="flex flex-col items-center">
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {stats.totalSchools}
          </p>
          <p className="text-xs md:text-sm text-gray-500">Colleges</p>
        </div>

        {/* We removed Emails Sent, so just 2 columns total */}
        <div className="flex flex-col items-center">
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {safeCompletion}%
          </p>
          <p className="text-xs md:text-sm text-gray-500">Complete</p>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">Profile Completion</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${safeCompletion}%` }}
            transition={{ duration: 1, type: "spring", stiffness: 80 }}
          />
        </div>
        <p className="text-xs mt-2 text-gray-500">
          Your profile is {safeCompletion}% complete!
        </p>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-end">
        <button
          onClick={() => (window.location.href = "/dashboard/profile/background")}
          className="
            px-4
            py-2
            bg-blue-600
            text-white
            text-sm
            font-medium
            rounded-md
            shadow
            hover:bg-blue-700
            transition
          "
        >
          Edit Background
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileWidget;
