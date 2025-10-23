import { z } from 'zod';

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  company: z.string()
    .max(255, 'Company name must not exceed 255 characters')
    .optional(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must not exceed 1000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Assessment organization info validation schema
export const organizationInfoSchema = z.object({
  organizationName: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s&.,'"-]+$/, 'Organization name contains invalid characters'),
  industry: z.string()
    .min(2, 'Industry must be at least 2 characters')
    .max(255, 'Industry must not exceed 255 characters'),
});

export type OrganizationInfoData = z.infer<typeof organizationInfoSchema>;

// Overview consultation form validation schema
export const consultationFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  organization: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(255, 'Organization name must not exceed 255 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must not exceed 1000 characters'),
});

export type ConsultationFormData = z.infer<typeof consultationFormSchema>;
