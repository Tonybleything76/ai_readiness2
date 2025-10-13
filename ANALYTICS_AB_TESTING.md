# Analytics & A/B Testing Guide

## Overview

This application includes comprehensive analytics tracking and A/B testing capabilities to measure conversion improvements and optimize the user experience.

## Analytics Implementation

### Google Analytics 4 Integration

The application uses Google Analytics 4 (GA4) for tracking user interactions and conversions.

#### Setup Instructions

1. **Create a GA4 Property** (if you haven't already):
   - Go to [Google Analytics](https://analytics.google.com)
   - Navigate to Admin > Property > Data Streams > Web
   - Create a new web stream for your domain
   - Copy the Measurement ID (starts with "G-")

2. **Add the Measurement ID to Replit**:
   - Open your Replit project
   - Go to the "Secrets" tab (🔒 icon in the left sidebar)
   - Add a new secret:
     - Key: `VITE_GA_MEASUREMENT_ID`
     - Value: Your GA4 Measurement ID (e.g., `G-XXXXXXXXXX`)

3. **Restart the Application**:
   - After adding the secret, restart your application
   - Analytics will automatically initialize on app load

### Privacy & Compliance

The analytics implementation includes privacy-first features:

- **Cookie Consent Banner**: Users must consent before any tracking begins
- **IP Anonymization**: All IP addresses are anonymized in GA4
- **Opt-out Support**: Users can decline tracking at any time
- **localStorage Persistence**: User consent is saved locally

### What We Track

#### 1. Page Views
- Automatically tracked on every route change
- Includes full page path

#### 2. CTA Click Events
All call-to-action buttons are tracked with contextual data:
- **Event Name**: `cta_click`
- **Category**: `conversion`
- **Label**: Specific CTA identifier (e.g., `hero_primary_cta_variant_a`)
- **Parameters**:
  - `variant`: A/B test variant (A or B)
  - `tier`: Assessment tier (free or full)
  - `location`: Where the CTA is located (hero, navigation, pricing_card, etc.)

**Tracked CTAs**:
- Hero section CTAs (primary and secondary, both variants)
- Navigation "Get Started" button (desktop and mobile)
- Pricing page CTAs (free and full assessment)
- All other assessment-related CTAs throughout the app

#### 3. Assessment Events

**Assessment Start**:
- **Event Name**: `assessment_start`
- **Category**: `engagement`
- **Label**: `assessment_start_{tier}`
- **Parameters**:
  - `tier`: Assessment tier (free or full)
  - `timestamp`: ISO timestamp

**Assessment Completion**:
- **Event Name**: `assessment_complete`
- **Category**: `conversion`
- **Label**: `assessment_complete_{tier}`
- **Parameters**:
  - `tier`: Assessment tier
  - `resultId`: Unique result identifier
  - `questionCount`: Number of questions answered
  - `timestamp`: ISO timestamp

#### 4. A/B Test Exposure
- **Event Name**: `ab_test_view`
- **Category**: `ab_test`
- **Label**: `hero_variant_{A|B}`
- **Parameters**:
  - `variant`: The variant shown to the user
  - `page`: The page where variant was shown

## A/B Testing

### Current Test: Hero Copy & CTA Hierarchy

We're testing two variants of the hero section on the landing page to optimize conversions.

#### Variant A (Control)
- **Title**: "Unlock Your AI Advantage"
- **Description**: "Get a detailed, 9-dimension scorecard, executive report, and AI roadmap. Choose the free preview or the full assessment with expert analysis."
- **Primary CTA**: "Start Full Readiness Assessment" (links to full assessment)
- **Secondary CTA**: "Preview With Free 25-Question Assessment" (links to free assessment)
- **Hypothesis**: Users prefer starting with the comprehensive option

#### Variant B (Treatment)
- **Title**: "Is Your Organization AI-Ready?"
- **Description**: "Discover where you stand with our comprehensive 9-pillar assessment. Get actionable insights, expert recommendations, and a customized roadmap to AI success."
- **Primary CTA**: "Get Your Free AI Readiness Score" (links to free assessment)
- **Secondary CTA**: "Start Full 90-Question Assessment" (links to full assessment)
- **Hypothesis**: Leading with the free option reduces friction and increases conversion

### How A/B Testing Works

1. **Variant Assignment**:
   - Users are randomly assigned to Variant A or B (50/50 split)
   - Assignment is stored in `localStorage` for consistency across sessions
   - Assignment can be overridden using environment variables (see below)

2. **Tracking**:
   - Variant exposure is tracked when the landing page loads
   - All CTA clicks include the variant in event parameters
   - Assessment completions can be correlated with variant exposure

### Controlling A/B Test Variants

#### For Development/Testing
You can force a specific variant using environment variables:

1. **Set Environment Variable**:
   - Go to Replit Secrets tab
   - Add key: `VITE_AB_TEST_VARIANT`
   - Add value: `A` or `B`

2. **Restart Application**:
   - All users will see the specified variant
   - Useful for testing, demos, or QA

#### For Production
- Remove or don't set `VITE_AB_TEST_VARIANT` to enable random assignment
- Each user gets a consistent variant based on their initial random assignment

### Configuration Files

The A/B test is configured in `client/src/lib/ab-test.ts`:

```typescript
export const heroContent = {
  A: {
    title: 'Unlock Your AI Advantage',
    description: '...',
    primaryCTA: 'Start Full Readiness Assessment',
    secondaryCTA: 'Preview With Free 25-Question Assessment',
  },
  B: {
    title: 'Is Your Organization AI-Ready?',
    description: '...',
    primaryCTA: 'Get Your Free AI Readiness Score',
    secondaryCTA: 'Start Full 90-Question Assessment',
  },
};
```

## Monitoring Metrics

### Key Performance Indicators (KPIs)

1. **Conversion Rate by Variant**:
   - Track assessment completions per variant
   - Compare free vs. full assessment starts per variant
   - Formula: (Assessment Completions / Page Views) × 100

2. **CTA Click-Through Rate**:
   - Track primary vs. secondary CTA clicks per variant
   - Formula: (CTA Clicks / Page Views) × 100

3. **Assessment Completion Rate**:
   - Track assessments started vs. completed
   - Formula: (Assessment Completions / Assessment Starts) × 100

4. **Free-to-Full Conversion**:
   - Track users who complete free assessment and then start full
   - Requires cross-session tracking in GA4

### GA4 Dashboard Setup

#### Recommended Reports

1. **A/B Test Overview**:
   - Dimension: `event_label` (variant)
   - Metrics: Total events, conversions, conversion rate
   - Filter: `event_name` = `ab_test_view`

2. **CTA Performance**:
   - Dimension: `event_label` (CTA identifier)
   - Secondary dimension: Custom parameter `variant`
   - Metrics: Total clicks, unique users
   - Filter: `event_name` = `cta_click`

3. **Assessment Funnel**:
   - Step 1: `assessment_start` events
   - Step 2: `assessment_complete` events
   - Group by: Custom parameter `tier`

4. **Variant Comparison**:
   - Create a comparison between users with variant=A vs variant=B
   - Compare all conversion events

### Exporting Data

To analyze A/B test results:

1. **Google Analytics UI**:
   - Navigate to Reports > Engagement > Events
   - Filter by relevant events (`ab_test_view`, `cta_click`, `assessment_complete`)
   - Use custom parameters in exploration reports

2. **BigQuery Export** (for advanced analysis):
   - Link GA4 to BigQuery (free for standard tier)
   - Query event parameters directly
   - Example SQL:
   ```sql
   SELECT
     event_name,
     (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'variant') as variant,
     COUNT(*) as event_count
   FROM `project.dataset.events_*`
   WHERE event_name IN ('ab_test_view', 'assessment_complete')
   GROUP BY event_name, variant
   ```

## Testing Analytics Locally

Without a GA4 Measurement ID, analytics events are logged to the browser console:

```
[Analytics] Event: cta_click {
  event_category: "conversion",
  event_label: "hero_primary_cta_variant_a",
  variant: "A",
  tier: "full",
  location: "hero"
}
```

Open browser DevTools > Console to see these logs.

## Troubleshooting

### Analytics Not Working
1. ✅ Check that `VITE_GA_MEASUREMENT_ID` is set in Replit Secrets
2. ✅ Verify the Measurement ID starts with "G-"
3. ✅ Restart the application after adding secrets
4. ✅ Ensure you've accepted cookies in the consent banner
5. ✅ Check browser console for any errors

### A/B Test Not Showing Expected Variant
1. ✅ Clear `localStorage` in browser DevTools
2. ✅ Check if `VITE_AB_TEST_VARIANT` is set (overrides random assignment)
3. ✅ Verify implementation in `client/src/pages/landing.tsx`

### Events Not Appearing in GA4
1. ✅ Wait 24-48 hours for data to appear (GA4 has a delay)
2. ✅ Use GA4 DebugView for real-time validation
3. ✅ Enable debug mode: `gtag('config', 'GA_MEASUREMENT_ID', { debug_mode: true })`

## Next Steps

1. **Run the Test**: 
   - Deploy to production without `VITE_AB_TEST_VARIANT` set
   - Allow at least 2-4 weeks of data collection
   - Aim for statistical significance (at least 100 conversions per variant)

2. **Analyze Results**:
   - Compare conversion rates between variants
   - Look at secondary metrics (time on page, bounce rate)
   - Consider segment analysis (by industry, device type, etc.)

3. **Implement Winner**:
   - If Variant B wins, update the default hero content
   - If Variant A wins, keep current implementation
   - Document learnings for future tests

4. **Next Tests**:
   - Test different value propositions
   - Optimize pricing page CTAs
   - Test different assessment previews/demos
   - Experiment with social proof elements

## Files Modified

- `client/env.d.ts` - TypeScript environment variable definitions
- `client/src/lib/analytics.ts` - Core analytics utilities and GA4 integration
- `client/src/lib/ab-test.ts` - A/B test configuration and variant management
- `client/src/hooks/use-analytics.tsx` - React hook for page view tracking
- `client/src/components/CookieConsent.tsx` - Privacy-compliant consent banner
- `client/src/App.tsx` - Analytics initialization and page view tracking
- `client/src/pages/landing.tsx` - A/B tested hero section
- `client/src/pages/assessment.tsx` - Assessment start/completion tracking
- `client/src/components/Navigation.tsx` - Navigation CTA tracking
- `client/src/pages/pricing.tsx` - Pricing page CTA tracking
