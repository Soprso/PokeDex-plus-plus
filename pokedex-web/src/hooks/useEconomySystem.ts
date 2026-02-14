import type { EconomyData } from '@/types';
import { useUser } from '@clerk/clerk-react';
import { useCallback, useState } from 'react';

const DAILY_REWARD_AMOUNT = 50;

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
            return;
        }

        // Calculate new streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = economy.lastDailyRewardDate === yesterday.toLocaleDateString('en-CA');

        const newStreak = isConsecutive ? (economy.streak || 0) + 1 : 1;
        const newBalance = (economy.balance || 0) + DAILY_REWARD_AMOUNT;

        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    economy: {
                        ...economy,
                        balance: newBalance,
                        lastDailyRewardDate: today,
                        streak: newStreak,
                    },
                },
            });

            setRewardClaimed({
                claimed: true,
                amount: DAILY_REWARD_AMOUNT,
                streak: newStreak,
            });
        } catch (error) {
            console.error('Failed to claim daily reward:', error);
        } finally {
            setIsClaiming(false);
        }
    }, [isLoaded, user, isClaiming]);

    return {
        checkDailyReward,
        rewardClaimed,
        resetRewardState: () => setRewardClaimed(null),
    };
}
