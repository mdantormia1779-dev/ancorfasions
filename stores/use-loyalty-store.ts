import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  status: "locked" | "available" | "redeemed";
  category: "discount" | "shipping" | "gift" | "event";
}

interface LoyaltyState {
  points: number;
  tier: LoyaltyTier;
  lifetimePoints: number;
  rewards: Reward[];
  addPoints: (amount: number) => void;
  redeemReward: (rewardId: string) => void;
}

const initialRewards: Reward[] = [
  {
    id: "r1",
    title: "Free Premium Shipping",
    description: "Get free next-day delivery on your next order.",
    pointsCost: 500,
    status: "available",
    category: "shipping",
  },
  {
    id: "r2",
    title: "10% Off Order",
    description: "Receive a 10% discount on any full-priced item.",
    pointsCost: 1000,
    status: "available",
    category: "discount",
  },
  {
    id: "r3",
    title: "Exclusive Birthday Gift",
    description: "A special luxury accessory curated just for you.",
    pointsCost: 2000,
    status: "locked",
    category: "gift",
  },
  {
    id: "r4",
    title: "VIP Event Invite",
    description: "Invitation to our private seasonal collection launch.",
    pointsCost: 5000,
    status: "locked",
    category: "event",
  },
];

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set) => ({
      points: 1250,
      tier: "Silver",
      lifetimePoints: 2450,
      rewards: initialRewards,
      addPoints: (amount) =>
        set((state) => {
          const newPoints = state.points + amount;
          const newLifetime = state.lifetimePoints + amount;
          
          let newTier: LoyaltyTier = state.tier;
          if (newLifetime >= 10000) newTier = "Platinum";
          else if (newLifetime >= 5000) newTier = "Gold";
          else if (newLifetime >= 1000) newTier = "Silver";
          else newTier = "Bronze";

          return { points: newPoints, lifetimePoints: newLifetime, tier: newTier };
        }),
      redeemReward: (rewardId) =>
        set((state) => {
          const reward = state.rewards.find((r) => r.id === rewardId);
          if (!reward || reward.status !== "available" || state.points < reward.pointsCost) {
            return state;
          }
          return {
            points: state.points - reward.pointsCost,
            rewards: state.rewards.map((r) =>
              r.id === rewardId ? { ...r, status: "redeemed" } : r
            ),
          };
        }),
    }),
    {
      name: "anchor-loyalty-storage",
    }
  )
);
