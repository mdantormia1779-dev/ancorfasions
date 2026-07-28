'use client';

import { useEffect, useRef } from 'react';
import { useCheckoutStore } from '@/stores/use-checkout-store';

export function CheckoutStoreInitializer({ cartId }: { cartId: string }) {
  const initialized = useRef(false);
  const { fetchSession } = useCheckoutStore();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchSession(cartId);
    }
  }, [cartId, fetchSession]);

  return null;
}
