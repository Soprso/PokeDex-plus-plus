import type { EconomyData } from '@/types';
import { useUser } from '@clerk/clerk-react';
import { useCallback, useState } from 'react';

const DAILY_REWARD_AMOUNT = 50;
const STREAK_BONUS = 350;
const STREAK_INTERVAL = 7;

export function useEconomySystem() {
    const { user, isLoaded } = useUser();
    const [rewardClaimed, setRewardClaimed] = useState<{ claimed: boolean; amount: number; streak: number } | null>(null);
    const [isClaiming, setIsClaiming] = useState(false);

    const checkDailyReward = useCallback(async () => {
        if (!isLoaded || !user || isClaiming) return;
        setIsClaiming(true);

        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const economy = (user.unsafeMetadata.economy as EconomyData) || {
            balance: 0,
            lastDailyRewardDate: '',
            streak: 0,
        };

        // Check if already claimed today
        console.log('Checking Daily Reward:', { lastDate: economy.lastDailyRewardDate, today });
        if (economy.lastDailyRewardDate === today) {
            console.log('Daily Reward already claimed for today');

            // Self-correction for invalid streaks found in metadata
            if (economy.streak > STREAK_INTERVAL) {
                console.log('Correcting streak in metadata:', economy.streak);
                try {
                    await user.update({
                        unsafeMetadata: {
                            ...user.unsafeMetadata,
                            economy: {
                                ...economy,
                                streak: 1 // Recover to 1
                            }
                        }
                    });
                } catch (e) {
                    console.error('Failed to self-correct streak:', e);
                }
            }

            setIsClaiming(false);
            return;
        }

        // Calculate new streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = economy.lastDailyRewardDate === yesterday.toLocaleDateString('en-CA');

        const currentStreak = economy.streak || 0;
        let newStreak = isConsecutive ? currentStreak + 1 : 1;

        // If the streak was already 7 (or more due to bug), reset to 1
        if (newStreak > STREAK_INTERVAL) {
            newStreak = 1;
        }

        const isBonusDay = newStreak === STREAK_INTERVAL;
        const rewardAmount = DAILY_REWARD_AMOUNT + (isBonusDay ? STREAK_BONUS : 0);
        const newBalance = (economy.balance || 0) + rewardAmount;

        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    economy: {
                        ...economy,
                        balance: newBalance,
                        lastDailyRewardDate: today,
                        streak: newStreak, // Store the actual new streak (1-7)
                    },
                },
            });

            setRewardClaimed({
                claimed: true,
                amount: rewardAmount,
                streak: newStreak,
            });
        } catch (error) {
            console.error('Failed to claim daily reward:', error);
        } finally {
            setIsClaiming(false);
        }
    }, [isLoaded, user, isClaiming]);

    const debugSetStreak = useCallback(async (streak: number) => {
        if (!user) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    economy: {
                        ...(user.unsafeMetadata.economy as any),
                        streak: streak,
                        lastDailyRewardDate: yesterdayStr
                    }
                }
            });
            console.log(`Debug: Streak set to ${streak}, last reward date set to ${yesterdayStr}`);
        } catch (error) {
            console.error('Debug: Failed to set streak:', error);
        }
    }, [user]);

    return {
        checkDailyReward,
        rewardClaimed,
        debugSetStreak,
        resetRewardState: () => setRewardClaimed(null),
    };
}
