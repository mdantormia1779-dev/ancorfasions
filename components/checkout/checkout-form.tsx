'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/stores/use-checkout-store';
import { useCartStore } from '@/stores/use-cart-store';
import { checkoutFormSchema, CheckoutFormValues } from '@/schemas/checkout.schema';
import { processCheckoutAction } from '@/lib/actions/checkout.actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutForm({ checkoutSessionId }: { checkoutSessionId: string }) {
  const router = useRouter();
  const { cart } = useCartStore();
  const { formData, currentStep, updateStep } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      information: {
        email: formData.information?.email || '',
        shipping_address: {
          first_name: formData.information?.shipping_address?.first_name || '',
          last_name: formData.information?.shipping_address?.last_name || '',
          phone: formData.information?.shipping_address?.phone || '',
          address_line_1: formData.information?.shipping_address?.address_line_1 || '',
          address_line_2: formData.information?.shipping_address?.address_line_2 || '',
          city: formData.information?.shipping_address?.city || '',
          postal_code: formData.information?.shipping_address?.postal_code || '',
          country: formData.information?.shipping_address?.country || 'Bangladesh',
        },
        save_information: false,
      },
      shipping: {
        shipping_method: formData.shipping?.shipping_method || 'home_delivery',
      },
      payment: {
        payment_method: formData.payment?.payment_method || 'COD',
        billing_address_same_as_shipping: formData.payment?.billing_address_same_as_shipping ?? true,
      },
      notes: formData.notes || '',
    },
  });

  const billingSameAsShipping = form.watch('payment.billing_address_same_as_shipping');
  const activeStep = currentStep === 'COMPLETED' ? 'REVIEW' : currentStep;

  const handleNextStep = async (step: 'INFORMATION' | 'SHIPPING' | 'PAYMENT' | 'REVIEW') => {
    // Basic validation before moving to next step
    let isValid = false;
    if (step === 'SHIPPING') {
      isValid = await form.trigger('information');
    } else if (step === 'PAYMENT') {
      isValid = await form.trigger(['information', 'shipping']);
    } else if (step === 'REVIEW') {
      isValid = await form.trigger(['information', 'shipping', 'payment']);
    }

    if (isValid) {
      updateStep(step);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart?.id) return;
    
    setIsSubmitting(true);
    try {
      const res = await processCheckoutAction(cart.id, checkoutSessionId, data);
      
      if (res.success && res.orderId) {
        toast.success('Order placed successfully!');
        if (res.paymentPayload && data.payment.payment_method !== 'COD') {
          // Redirect to payment initialization endpoint for gateway integration
          router.push(`/api/payment/init?order_id=${res.orderId}&method=${data.payment.payment_method}`);
        } else {
          router.push(`/checkout/success?order_id=${res.orderId}`);
        }
      } else {
        toast.error(res.error || 'Failed to process checkout');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Step 1: Information */}
        <div className={`space-y-6 ${activeStep !== 'INFORMATION' && 'hidden'}`}>
          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <FormField
              control={form.control}
              name="information.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 mt-8">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="information.shipping_address.first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="information.shipping_address.last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="information.shipping_address.phone"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="01XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="information.shipping_address.address_line_1"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="House, Road, Area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="information.shipping_address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Dhaka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="information.shipping_address.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="1212" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="button" 
            size="lg" 
            className="w-full mt-6" 
            onClick={() => handleNextStep('SHIPPING')}
          >
            Continue to Shipping <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Step 2: Shipping */}
        <div className={`space-y-6 ${activeStep !== 'SHIPPING' && 'hidden'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shipping Method</h2>
            <Button variant="ghost" size="sm" type="button" onClick={() => updateStep('INFORMATION')}>
              Edit Information
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="shipping.shipping_method"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <RadioGroupItem value="home_delivery" />
                      </FormControl>
                      <div className="flex-1 flex justify-between">
                        <FormLabel className="font-medium cursor-pointer">
                          Home Delivery (Inside Dhaka)
                        </FormLabel>
                        <span className="font-medium">৳ 100</span>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <RadioGroupItem value="home_delivery_outside" />
                      </FormControl>
                      <div className="flex-1 flex justify-between">
                        <FormLabel className="font-medium cursor-pointer">
                          Home Delivery (Outside Dhaka)
                        </FormLabel>
                        <span className="font-medium">৳ 150</span>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="button" 
            size="lg" 
            className="w-full mt-6" 
            onClick={() => handleNextStep('PAYMENT')}
          >
            Continue to Payment <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Step 3: Payment */}
        <div className={`space-y-6 ${activeStep !== 'PAYMENT' && activeStep !== 'REVIEW' && 'hidden'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment</h2>
            <Button variant="ghost" size="sm" type="button" onClick={() => updateStep('SHIPPING')}>
              Edit Shipping
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="payment.payment_method"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <RadioGroupItem value="COD" />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer">
                        Cash on Delivery
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <RadioGroupItem value="SSLCOMMERZ" />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer">
                        Cards / Mobile Banking (SSLCommerz)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-md">
                      <FormControl>
                        <RadioGroupItem value="BKASH" />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer">
                        bKash
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Billing Address</h3>
            <FormField
              control={form.control}
              name="payment.billing_address_same_as_shipping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Same as shipping address
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="mt-8">
                <FormLabel>Order Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any special instructions?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            size="lg" 
            className="w-full mt-8" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Order...
              </>
            ) : (
              'Complete Order'
            )}
          </Button>
        </div>

      </form>
    </Form>
  );
}
