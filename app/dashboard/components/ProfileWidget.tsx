import { FaUserCircle } from 'react-icons/fa';
import styles from '@/styles/ProfileWidget.module.css';

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
    <div className={styles.container}>
      {/* Profile Section */}
      <div className={styles.profileSection}>
        <FaUserCircle className={styles.profileIcon} />
        <h2 className={styles.userName}>{userName}</h2>
      </div>

      {/* Inline Stats */}
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{stats.totalSchools}</p>
          <p className={styles.statLabel}>Colleges</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{stats.emailsSent}</p>
          <p className={styles.statLabel}>Emails Sent</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statValue}>{stats.profileCompletion}%</p>
          <p className={styles.statLabel}>Profile Completion</p>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className={styles.completionSection}>
        <h3 className={styles.completionTitle}>Profile Completion</h3>
        <div className={styles.completionBar}>
          <div
            className={`${styles.completionProgress} ${styles[`progress${Math.min(Math.max(0, profileCompletion), 100)}`]}`}
          ></div>
        </div>
        <p className={styles.completionText}>
          Your Profile is {profileCompletion}% Complete!
        </p>
      </div>

      {/* Edit Profile Button */}
      <button
        className={styles.editButton}
        onClick={() => window.location.href = '/dashboard/profile/background'}
      >
        Edit Background
      </button>
    </div>
  );
};

export default ProfileWidget;
