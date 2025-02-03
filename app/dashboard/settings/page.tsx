'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface UserSubscription {
  status: string;
  plan_id: string;
  plan_name: string;
}

interface ReferralRewards {
  total_earned: number;
  currency: string;
  next_reward_in: number;
}

const isValidReferralCode = (code: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(code);
};

const isPayingSubscription = (subscription: UserSubscription | null): boolean => {
  if (!subscription) return false;
  const isActive = subscription.status === 'active';
  const isPaidTier = subscription.plan_id === 'plus' || subscription.plan_id === 'pro';
  return isActive && isPaidTier;
};

export default function SettingsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<{
    total_users: number;
    paying_users: number;
  } | null>(null);
  const [referralRewards, setReferralRewards] = useState<ReferralRewards | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    fetchUserReferralInfo();
  }, []);

  const updateReferralPayingStatus = async (userId: string) => {
    try {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status, plan_id, plan_name')
        .eq('user_id', userId)
        .single();

      const isPaying = isPayingSubscription(subscription);

      const { data: referralUsage } = await supabase
        .from('referral_usage')
        .select('used_referral_code')
        .eq('user_id', userId)
        .single();

      if (referralUsage) {
        const { error: updateError } = await supabase
          .from('referral_usage')
          .update({ is_paying: isPaying })
          .eq('user_id', userId)
          .select();

        if (updateError) {
          throw new Error('Error updating data');
        }

        const { count: payingCount, error: countError } = await supabase
          .from('referral_usage')
          .select('*', { count: 'exact', head: true })
          .eq('used_referral_code', referralUsage.used_referral_code)
          .eq('is_paying', true);

        if (countError) {
          throw new Error('Error fetching data');
        }

        const { error: updateCodeError } = await supabase
          .from('referral_codes')
          .update({ paying_users_count: payingCount || 0 })
          .eq('referral_code', referralUsage.used_referral_code);

        if (updateCodeError) {
          throw new Error('Error updating data');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateReferralPayingStatus(user.id);
      }
    };

    checkSubscription();

    const interval = setInterval(checkSubscription, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUserReferralInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await updateReferralPayingStatus(user.id);
    
    // Check if user has a referral code
    const { data: referralData } = await supabase
      .from('referral_codes')
      .select('referral_code, used_by_count, paying_users_count')
      .eq('user_id', user.id)
      .single();

    if (referralData) {
      setUserReferralCode(referralData.referral_code);
      const payingUsers = referralData.paying_users_count;
      const rewardsEarned = Math.floor(payingUsers / 5) * 5; 
      const nextRewardIn = 5 - (payingUsers % 5); 
      
      setReferralStats({
        total_users: referralData.used_by_count,
        paying_users: payingUsers
      });
      
      setReferralRewards({
        total_earned: rewardsEarned,
        currency: 'USD',
        next_reward_in: nextRewardIn
      });
    }

    const { data: usageData } = await supabase
      .from('referral_usage')
      .select('used_referral_code')
      .eq('user_id', user.id)
      .single();

    if (usageData) {
      setAppliedCode(usageData.used_referral_code);
    }
  };

  const handleSubmitReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedCode = referralCode.trim();
    if (!trimmedCode) {
      setError('Please enter data');
      return;
    }

    if (!isValidReferralCode(trimmedCode)) {
      setError('Invalid data format');
      return;
    }

    const normalizedCode = trimmedCode.toLowerCase();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingUsage } = await supabase
        .from('referral_usage')
        .select('used_referral_code')
        .eq('user_id', user.id)
        .single();

      if (existingUsage) {
        setError('Data already exists');
        setAppliedCode(existingUsage.used_referral_code);
        return;
      }

      // Verify referral code exists (case insensitive)
      const { data: referralExists } = await supabase
        .from('referral_codes')
        .select('referral_code')
        .ilike('referral_code', normalizedCode)
        .single();

      if (!referralExists) {
        setError('Data not found');
        return;
      }

      const exactCode = referralExists.referral_code;

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status, plan_id, plan_name')
        .eq('user_id', user.id)
        .single();

      const isPaying = isPayingSubscription(subscription);

      const { error: usageError } = await supabase
        .from('referral_usage')
        .insert({
          user_id: user.id,
          used_referral_code: exactCode,
          is_paying: isPaying
        });

      if (usageError) throw usageError;

      const { count: totalCount } = await supabase
        .from('referral_usage')
        .select('*', { count: 'exact', head: true })
        .eq('used_referral_code', exactCode);

      const { count: payingCount } = await supabase
        .from('referral_usage')
        .select('*', { count: 'exact', head: true })
        .eq('used_referral_code', exactCode)
        .eq('is_paying', true);

      await supabase
        .from('referral_codes')
        .update({ 
          used_by_count: totalCount || 0,
          paying_users_count: payingCount || 0
        })
        .eq('referral_code', exactCode);

      setAppliedCode(exactCode);
      setSuccess('Referral code applied successfully!');
      setReferralCode('');
      
      fetchUserReferralInfo();
    } catch (error) {
      setError('Error processing data');
      console.error(error);
    }
  };

  const handleCreateReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidReferralCode(newReferralCode)) {
      setError('Invalid data format');
      return;
    }

    const normalizedCode = newReferralCode.toLowerCase();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('id')
        .ilike('referral_code', normalizedCode)
        .single();

      if (existingCode) {
        setError('Data already exists');
        return;
      }

      const { error: createError } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          referral_code: normalizedCode 
        });

      if (createError) throw createError;

      setSuccess('Referral code created successfully!');
      setUserReferralCode(normalizedCode);
      setNewReferralCode('');
    } catch (error) {
      setError('Error processing data');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Referral Program Information */}
          <div className="mb-8 bg-blue-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Referral Program</h2>
            <p className="text-sm text-blue-800 mb-2">
              Earn $5 USD for every 5 paying users that sign up using your referral code!
            </p>
            <p className="text-xs text-blue-700">
              Rewards are paid out in your local currency equivalent.
            </p>
          </div>

          {/* User's Referral Code Section */}
          {userReferralCode ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Your Referral Code</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-lg font-mono">{userReferralCode}</p>
                {referralStats && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-600">
                      <p>Total Users: {referralStats.total_users}</p>
                      <p>Paying Users: {referralStats.paying_users}</p>
                    </div>
                    {referralRewards && (
                      <div className="border-t pt-2">
                        <p className="text-sm font-semibold text-green-600">
                          Total Earned: ${referralRewards.total_earned} {referralRewards.currency}
                        </p>
                        <p className="text-xs text-gray-500">
                          {referralRewards.next_reward_in} more paying users needed for next reward
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Note: Referral codes cannot be changed once created.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateReferralCode} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Create Your Referral Code</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReferralCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setNewReferralCode(value);
                  }}
                  placeholder="Enter desired referral code"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Use Referral Code Section */}
          {!appliedCode ? (
            <form onSubmit={handleSubmitReferralCode}>
              <h2 className="text-lg font-semibold mb-4">Use a Referral Code</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    setReferralCode(value);
                  }}
                  placeholder="Enter referral code"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Note: You can only use one referral code, and it cannot be changed later.
              </p>
            </form>
          ) : (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Applied Referral Code</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-lg font-mono">{appliedCode}</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                This referral code has been applied to your account and cannot be changed.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-600">{error}</div>
          )}
          {success && (
            <div className="mt-4 text-green-600">{success}</div>
          )}
        </div>
      </div>
    </div>
  );
} 