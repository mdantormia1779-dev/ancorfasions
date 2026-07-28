import { z } from 'zod';

// ==========================================
// 1. SHARED SCHEMAS
// ==========================================

export const addressSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(11, 'Phone number must be at least 11 digits').max(20),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address_line_1: z.string().min(1, 'Address is required').max(255),
  address_line_2: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postal_code: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().default('Bangladesh'),
});

// ==========================================
// 2. CHECKOUT STEP SCHEMAS
// ==========================================

export const checkoutInformationSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  shipping_address: addressSchema,
  save_information: z.boolean().default(false),
});

export const checkoutShippingSchema = z.object({
  shipping_method: z.string().min(1, 'Please select a shipping method'),
});

export const checkoutPaymentSchema = z.object({
  payment_method: z.string().min(1, 'Please select a payment method'),
  billing_address_same_as_shipping: z.boolean().default(true),
  billing_address: addressSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.billing_address_same_as_shipping && !data.billing_address) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Billing address is required if different from shipping',
      path: ['billing_address'],
    });
  }
});

// ==========================================
// 3. COMPLETE CHECKOUT SCHEMA
// ==========================================

export const checkoutFormSchema = z.object({
  information: checkoutInformationSchema,
  shipping: checkoutShippingSchema,
  payment: checkoutPaymentSchema,
  notes: z.string().max(500).optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
export type CheckoutInformationFormValues = z.infer<typeof checkoutInformationSchema>;
export type CheckoutShippingFormValues = z.infer<typeof checkoutShippingSchema>;
export type CheckoutPaymentFormValues = z.infer<typeof checkoutPaymentSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
