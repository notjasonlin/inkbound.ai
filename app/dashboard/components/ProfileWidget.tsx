import { FaUserCircle } from 'react-icons/fa';

interface ProfileWidgetProps {
  userName: string;
  stats: {
    totalSchools: string;
    emailsSent: string;
    profileCompletion: string;
  };
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ userName, stats }) => {
  const profileCompletion = parseInt(stats.profileCompletion);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-4">
        {/* Profile Icon */}
        <FaUserCircle className="text-5xl text-gray-400 mb-2" />

        {/* User Name */}
        <h2 className="text-md font-bold text-gray-800">{userName}</h2>
      </div>

      {/* Inline Stats */}
      <div className="flex justify-around w-full mb-4">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{stats.totalSchools}</p>
          <p className="text-sm text-gray-600">Colleges</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{stats.emailsSent}</p>
          <p className="text-sm text-gray-600">Emails Sent</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{stats.profileCompletion}%</p>
          <p className="text-sm text-gray-600">Profile Completion</p>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Profile Completion</h3>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div
            className="bg-green-400 h-2 rounded-full"
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600">Your Profile is {profileCompletion}% Complete!</p>
      </div>

      {/* Edit Profile Button */}
      <button
        className="mt-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 transition"
        onClick={() => window.location.href = '/dashboard/profile/background'}
      >
        Edit Background
      </button>
    </div>
  );
};

export default ProfileWidget;
