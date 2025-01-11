import { FaUserCircle } from 'react-icons/fa';
import styles from '@/styles/ProfileWidget.module.css';
import DashboardMetrics from './DashboardMetrics';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ProfileWidgetProps {
  userName: string;
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ userName }) => {
  const [completion, setCompletion] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchCompletion() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('player_profiles')
        .select('stats')
        .eq('user_id', user.id)
        .single();

      const profileFields = profile?.stats ? Object.keys(profile.stats).filter(key => 
        profile.stats[key] !== null && 
        profile.stats[key] !== undefined && 
        profile.stats[key] !== '' &&
        profile.stats[key] !== 0
      ).length : 0;
      const totalFields = 8;
      setCompletion(Math.min(100, Math.round((profileFields / totalFields) * 100)));
    }

    fetchCompletion();
  }, []);

  return (
    <div className={styles.container}>
      {/* Profile Section */}
      <div className={styles.profileSection}>
        <FaUserCircle className={styles.profileIcon} />
        <h2 className={styles.userName}>{userName}</h2>
      </div>

      {/* Stats Section */}
      <div className={styles.statsContainer}>
        <DashboardMetrics />
      </div>

      {/* Profile Completion Bar */}
      <div className={styles.completionSection}>
        <h3 className={styles.completionTitle}>Profile Completion</h3>
        <div className={styles.completionBar}>
          <div
            className={`${styles.completionProgress} ${styles[`progress${Math.min(Math.max(0, completion), 100)}`]}`}
          ></div>
        </div>
        <p className={styles.completionText}>
          Your Profile is {completion}% Complete!
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