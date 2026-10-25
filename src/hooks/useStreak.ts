import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { calculateStreak, getBadges } from '../lib/ml/streak';
import type { EnergyLog, Badge, StreakResult } from '../types';
import confetti from 'canvas-confetti';

const showBadgeToast = (badge: Badge) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.zIndex = '9999';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.pointerEvents = 'none';

  const toast = document.createElement('div');
  toast.style.background = 'linear-gradient(to right, var(--accent), #00A670)';
  toast.style.padding = '16px 24px';
  toast.style.margin = '16px';
  toast.style.borderRadius = '12px';
  toast.style.boxShadow = '0 10px 25px rgba(0,214,143,0.3)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '16px';
  toast.style.transform = 'translateY(-150%)';
  toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  toast.innerHTML = `
    <div style="font-size: 28px;">${badge.icon}</div>
    <div style="color: #07090F;">
      <div style="font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; opacity: 0.9;">New badge unlocked!</div>
      <div style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800;">${badge.name}</div>
      <div style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; opacity: 0.85; margin-top: 2px;">${badge.description}</div>
    </div>
  `;

  container.appendChild(toast);
  document.body.appendChild(container);

  // Trigger animation and confetti
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.1 },
      colors: ['#00D68F', '#ffffff', '#FFD700']
    });
  }, 100);

  // Remove sequence
  setTimeout(() => {
    toast.style.transform = 'translateY(-150%)';
    setTimeout(() => {
      document.body.removeChild(container);
    }, 400);
  }, 4000);
};

export function useStreak(userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [streakResult, setStreakResult] = useState<StreakResult>({
    currentStreak: 0,
    longestStreak: 0,
    greenCredits: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    isTodayCounted: false
  });
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Parallel fetch of logs, appliances count, user profile (target), and existing badges
    const loadData = async () => {
      try {
        setLoading(true);
        // We will listen to logs
        const logsRef = collection(db, 'energy_logs');
        const q = query(logsRef, where('userId', '==', userId));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnergyLog));
          
          // Get other data
          const userDoc = await getDoc(doc(db, 'users', userId));
          const targetKwh = userDoc.exists() && userDoc.data().profile?.monthlyTarget ? userDoc.data().profile.monthlyTarget : 0;
          const storedLongestStreak = userDoc.exists() && userDoc.data().profile?.longestStreak ? userDoc.data().profile.longestStreak : 0;

          const appliancesSnap = await getDocs(query(collection(db, 'appliances'), where('userId', '==', userId)));
          const applianceCount = appliancesSnap.size;

          const badgesRef = collection(db, 'users', userId, 'badges');
          const badgesSnap = await getDocs(badgesRef);
          const earnedDates: Record<string, string> = {};
          badgesSnap.forEach(b => { earnedDates[b.id] = b.data().earnedAt; });

          const newStreakResult = calculateStreak(logs);
          
          // Respect historical longest streak
          newStreakResult.longestStreak = Math.max(storedLongestStreak, newStreakResult.longestStreak);

          const evaluatedBadges = getBadges(
            newStreakResult.currentStreak,
            newStreakResult.longestStreak,
            newStreakResult.greenCredits,
            logs,
            targetKwh,
            applianceCount,
            false, // hasTargetHit - mocked for now
            false, // hasResolvedAnomaly - mocked for now
            false, // hasReducedBill - mocked for now
            earnedDates
          );

          // Check for newly earned badges
          for (const badge of evaluatedBadges) {
            if (badge.earnedAt && !earnedDates[badge.id]) {
              // Just earned right now
              earnedDates[badge.id] = badge.earnedAt;
              await setDoc(doc(badgesRef, badge.id), { earnedAt: badge.earnedAt });
              showBadgeToast(badge);
            }
          }

          setStreakResult(newStreakResult);
          setBadges(evaluatedBadges);

          // Save streak to profile if it changed
          if (newStreakResult.currentStreak > 0 || newStreakResult.longestStreak > storedLongestStreak) {
            await setDoc(doc(db, 'users', userId), {
              profile: {
                currentStreak: newStreakResult.currentStreak,
                longestStreak: newStreakResult.longestStreak,
                greenCredits: newStreakResult.greenCredits
              }
            }, { merge: true });
          }
          
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (e) {
        console.error("Failed to load streak data", e);
        setLoading(false);
      }
    };

    const cleanup = loadData();
    // Use the functional unmount promise correctly
    return () => {
      cleanup.then(unsub => { if (unsub) unsub(); });
    };

  }, [userId]);

  return { streakResult, badges, loading };
}
