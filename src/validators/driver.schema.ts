import { z } from 'zod';
import { VehicleType } from '@/types/driver.types';

export type RegisterDriverSchema = z.infer<ReturnType<typeof registerDriverSchema>>;

export const registerDriverSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .min(1, { message: t('form-first-name-required') }),
    lastName: z
      .string()
      .min(1, { message: t('form-last-name-is-required') }),
    email: z
      .string()
      .min(1, { message: t('form-email-address-required') })
      .email({ message: t('form-invalid-email-address') }),
    phoneNumber: z
      .string()
      .min(1, { message: t('form-phone-number-is-required') }),
    password: z
      .string()
      .min(6, { message: t('form-password-must-be-6-characters') })
      .regex(/[A-Z]/, { message: t('form-password-contain-at-least-one-uppercase') })
      .regex(/[0-9]/, { message: t('form-password-contain-at-least-one-numerical') }),
    vehicleType: z.nativeEnum(VehicleType),
  });
