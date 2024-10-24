export type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
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
    priceMonthly: 0,
    priceYearly: 0,
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
    priceMonthly: 9,
    priceYearly: 72,
    description: 'For up to 20 schools',
    features: [
      'Access to 20 schools',
      'Priority support',
      'Advanced email templates'
    ],
    stripePriceIdMonthly: 'price_1QB07kGqe0TKVbR1sCDgNKT5',
    stripePriceIdYearly: 'price_1QB08CGqe0TKVbR1y337C3ex',
    schoolLimit: 20,
    templateLimit: 20,
    aiCallLimit: 100
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29,
    priceYearly: 240,
    description: 'Unlimited schools access',
    features: [
      'Unlimited schools',
      '24/7 premium support',
      'Custom email templates',
      'Personalized advice'
    ],
    stripePriceIdMonthly: 'price_1Q9YrqGqe0TKVbR1zdGLM31V',
    stripePriceIdYearly: 'price_1QB065Gqe0TKVbR1Ychlgg4y',
    schoolLimit: 9999,
    templateLimit: 9999,
    aiCallLimit: 9999
  }
];
