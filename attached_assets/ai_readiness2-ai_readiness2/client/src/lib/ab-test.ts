export type ABTestVariant = 'A' | 'B';

const AB_VARIANT_KEY = 'ab_test_variant';

export const getABTestVariant = (): ABTestVariant => {
  const envVariant = import.meta.env.VITE_AB_TEST_VARIANT;
  if (envVariant === 'A' || envVariant === 'B') {
    return envVariant;
  }

  if (typeof window === 'undefined') return 'A';
  
  const storedVariant = localStorage.getItem(AB_VARIANT_KEY);
  if (storedVariant === 'A' || storedVariant === 'B') {
    return storedVariant;
  }

  const randomVariant: ABTestVariant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem(AB_VARIANT_KEY, randomVariant);
  return randomVariant;
};

export const setABTestVariant = (variant: ABTestVariant) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AB_VARIANT_KEY, variant);
};

export const heroContent = {
  A: {
    title: 'Unlock Your AI Advantage',
    description: 'Get a detailed, 9-dimension scorecard, executive report, and AI roadmap. Choose the free preview or the full assessment with expert analysis.',
    primaryCTA: 'Start Full Readiness Assessment',
    secondaryCTA: 'Preview With Free 25-Question Assessment',
  },
  B: {
    title: 'Is Your Organization AI-Ready?',
    description: 'Discover where you stand with our comprehensive 9-pillar assessment. Get actionable insights, expert recommendations, and a customized roadmap to AI success.',
    primaryCTA: 'Get Your Free AI Readiness Score',
    secondaryCTA: 'Start Full 90-Question Assessment',
  },
};
