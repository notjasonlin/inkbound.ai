import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import styles from '@/styles/ProfileWidget.module.css';

interface Metrics {
  collegeCount: number;
  emailsSent: number;
  profileCompletion: number;
}

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    collegeCount: 0,
    emailsSent: 0,
    profileCompletion: 0
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchMetrics() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favoriteSchools } = await supabase
        .from('favorite_schools')
        .select('favorite_count')
        .eq('uuid', user.id)
        .single();
      const { data: usage, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Full usage data:', usage);
      console.log('Usage error:', usageError);

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
      const completionPercentage = Math.min(100, Math.round((profileFields / totalFields) * 100));

      setMetrics({
        collegeCount: favoriteSchools?.favorite_count || 0,
        emailsSent: Number(usage?.schools_sent) || 0, 
        profileCompletion: completionPercentage
      });
    }

    fetchMetrics();
  }, []);

  return (
    <>
      <div className={styles.statItem}>
        <p className={styles.statValue}>{metrics.collegeCount}</p>
        <p className={styles.statLabel}>Colleges</p>
      </div>
      <div className={styles.statItem}>
        <p className={styles.statValue}>{metrics.emailsSent}</p>
        <p className={styles.statLabel}>Emails Sent</p>
      </div>
      <div className={styles.statItem}>
        <p className={styles.statValue}>{metrics.profileCompletion}%</p>
        <p className={styles.statLabel}>Profile Completion</p>
      </div>
    </>
  );
} 