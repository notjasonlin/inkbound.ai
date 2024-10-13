export type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  schoolLimit: number;
  templateLimit: number;
  aiCallLimit: number;
};

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    description: "You'll want to upgrade soon",
    features: [
      'Access to 1 school',
      'Basic support',
      'Limited email templates'
    ],
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    schoolLimit: 1,
    templateLimit: 5,
    aiCallLimit: 10
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 10,
    description: 'For up to 20 schools',
    features: [
      'Access to 20 schools',
      'Priority support',
      'Advanced email templates'
    ],
    stripePriceIdMonthly: 'price_MONTHLY_PLUS_ID',
    stripePriceIdYearly: 'price_YEARLY_PLUS_ID',
    schoolLimit: 20,
    templateLimit: 20,
    aiCallLimit: 100
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 30,
    description: 'Unlimited schools access',
    features: [
      'Unlimited schools',
      '24/7 premium support',
      'Custom email templates',
      'Personalized advice'
    ],
    stripePriceIdMonthly: 'price_MONTHLY_PRO_ID',
    stripePriceIdYearly: 'price_YEARLY_PRO_ID',
    schoolLimit: Infinity,
    templateLimit: Infinity,
    aiCallLimit: Infinity
  }
];
