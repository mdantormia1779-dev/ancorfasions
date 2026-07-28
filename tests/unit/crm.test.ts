import { describe, it, expect } from 'vitest';
import { createCRMLeadSchema, createCRMNoteSchema } from '../../schemas/crm.schema';

describe('CRM Schema Validation', () => {
  describe('Lead Schema', () => {
    it('should validate a correct lead', () => {
      const data = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        status: 'new'
      };
      const result = createCRMLeadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const data = {
        email: 'not-an-email',
      };
      const result = createCRMLeadSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Note Schema', () => {
    it('should validate note with profile_id', () => {
      const data = {
        profile_id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is a test note'
      };
      const result = createCRMNoteSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if neither profile_id nor lead_id is provided', () => {
      const data = {
        content: 'Note without association'
      };
      const result = createCRMNoteSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
