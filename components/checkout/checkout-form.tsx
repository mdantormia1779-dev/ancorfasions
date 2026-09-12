"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/stores/use-checkout-store";
import { useCartStore } from "@/stores/use-cart-store";
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from "@/schemas/checkout.schema";
import {
  processCheckoutAction,
  sendCodOtpAction,
} from "@/lib/actions/checkout.actions";
import { CodOtpDialog } from "@/components/checkout/cod-otp-dialog";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export function CheckoutForm({
  checkoutSessionId,
}: {
  checkoutSessionId: string;
}) {
  const router = useRouter();
  const { cart } = useCartStore();
  const { formData, currentStep, updateStep } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedShippingFee, setCalculatedShippingFee] = useState<number | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // COD Fraud Shield OTP Verification states
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpTarget, setOtpTarget] = useState("");
  const [otpTargetType, setOtpTargetType] = useState<"email" | "phone">("email");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(60);



  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      information: {
        email: formData.information?.email || "",
        shipping_address: {
          first_name: formData.information?.shipping_address?.first_name || "",
          last_name: formData.information?.shipping_address?.last_name || "",
          phone: formData.information?.shipping_address?.phone || "",
          address_line_1:
            formData.information?.shipping_address?.address_line_1 || "",
          address_line_2:
            formData.information?.shipping_address?.address_line_2 || "",
          city: formData.information?.shipping_address?.city || "",
          postal_code:
            formData.information?.shipping_address?.postal_code || "",
          country:
            formData.information?.shipping_address?.country || "Bangladesh",
        },
        save_information: false,
        create_account: false,
        password: "",
      },
      shipping: {
        shipping_method: formData.shipping?.shipping_method || "home_delivery",
      },
      payment: {
        payment_method: formData.payment?.payment_method || "COD",
        billing_address_same_as_shipping:
          formData.payment?.billing_address_same_as_shipping ?? true,
      },
      notes: formData.notes || "",
    },
  });

  const billingSameAsShipping = form.watch(
    "payment.billing_address_same_as_shipping"
  );
  const activeStep = currentStep === "COMPLETED" ? "REVIEW" : currentStep;

  const calculateShippingForCity = useCallback(async (city: string, method: string) => {
    if (!city) return;
    setIsCalculatingShipping(true);
    try {
      const isCOD = form.getValues("payment.payment_method") === "COD";
      const cartTotal = (cart?.items || []).reduce((total, item) => {
        const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
        return total + price * item.quantity;
      }, 0);
      const res = await fetch(
        `/api/shipping/rates?district=${encodeURIComponent(city)}&city=${encodeURIComponent(city)}&weightKg=0.5&orderValue=${cartTotal}&isCOD=${isCOD}`
      );
      const json = await res.json();
      if (json.success && json.data?.total != null) {
        setCalculatedShippingFee(json.data.total);
      } else {
        // Fallback to local defaults when DB has no zone configured
        setCalculatedShippingFee(method === "home_delivery" ? 100 : 150);
      }
    } catch {
      setCalculatedShippingFee(method === "home_delivery" ? 100 : 150);
    } finally {
      setIsCalculatingShipping(false);
    }
  }, [cart?.items, form]);

  const handleNextStep = async (
    step: "INFORMATION" | "SHIPPING" | "PAYMENT" | "REVIEW"
  ) => {
    // Basic validation before moving to next step
    let isValid = false;
    if (step === "SHIPPING") {
      isValid = await form.trigger("information");
      if (isValid) {
        const city = form.getValues("information.shipping_address.city");
        const method = city && city.toLowerCase().includes("dhaka")
          ? "home_delivery"
          : "home_delivery_outside";
        form.setValue("shipping.shipping_method", method);
        // Kick off dynamic rate calculation
        await calculateShippingForCity(city, method);
      }
    } else if (step === "PAYMENT") {
      isValid = await form.trigger(["information", "shipping"]);
    } else if (step === "REVIEW") {
      isValid = await form.trigger(["information", "shipping", "payment"]);
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

      // Check if server-side COD Fraud Shield requires OTP verification
      if (res.verificationRequired) {
        setOtpTarget(res.maskedTarget || data.information.email);
        setOtpTargetType(res.targetType || "email");
        setOtpCooldown(res.remainingCooldownSeconds || 60);
        setOtpError(null);
        setShowOtpDialog(true);
        setIsSubmitting(false);
        return;
      }

      if (res.success && res.orderId) {
        toast.success("Order placed successfully!");
        if (res.paymentPayload && data.payment.payment_method !== "COD") {
          // Redirect to payment initialization endpoint for gateway integration
          router.push(
            `/api/payment/init?order_id=${res.orderId}&method=${data.payment.payment_method}`
          );
        } else {
          router.push(`/checkout/success?order_id=${res.orderId}`);
        }
      } else {
        toast.error(res.error || "Failed to process checkout");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!cart?.id) return;
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const currentData = form.getValues();
      const res = await processCheckoutAction(
        cart.id,
        checkoutSessionId,
        currentData,
        otp
      );

      if (res.success && res.orderId) {
        setShowOtpDialog(false);
        toast.success("Order verified and placed successfully!");
        router.push(`/checkout/success?order_id=${res.orderId}`);
      } else {
        setOtpError(res.error || "Failed to verify code. Please try again.");
      }
    } catch {
      setOtpError("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    try {
      const currentData = form.getValues();
      const res = await sendCodOtpAction(checkoutSessionId, currentData);
      if (res.success) {
        toast.success("A new verification code has been dispatched.");
        setOtpError(null);
      } else {
        setOtpError(res.error || "Failed to resend verification code.");
      }
    } catch {
      setOtpError("Failed to resend verification code.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Information */}
        <div
          className={`space-y-6 ${activeStep !== "INFORMATION" && "hidden"}`}
        >
          <div>
            <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
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
            <h2 className="mb-4 mt-8 text-xl font-semibold">
              Shipping Address
            </h2>
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

            <div className="mt-4 grid grid-cols-2 gap-4">
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

          <div className="mt-4 p-4 border border-[#222] rounded-lg bg-[#111]">
            <FormField
              control={form.control}
              name="information.create_account"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-medium">
                      Save details & create an account
                    </FormLabel>
                    <p className="text-xs text-gray-400 mt-1">
                      Check this box to easily track your order and checkout faster next time.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("information.create_account") && (
              <FormField
                control={form.control}
                name="information.password"
                render={({ field }) => (
                  <FormItem className="mt-4 animate-in slide-in-from-top-2">
                    <FormLabel>Set a Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-6 w-full h-12 bg-[#1A1A1A] text-xs font-bold uppercase tracking-widest text-white hover:bg-black"
            onClick={() => handleNextStep("SHIPPING")}
          >
            Continue to Shipping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Step 2: Shipping */}
        <div className={`space-y-6 ${activeStep !== "SHIPPING" && "hidden"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shipping Method</h2>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => updateStep("INFORMATION")}
            >
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
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <RadioGroupItem value="home_delivery" />
                      </FormControl>
                      <div className="flex flex-1 justify-between">
                        <div className="flex flex-col">
                          <FormLabel className="cursor-pointer font-medium">
                            Home Delivery (Inside Dhaka)
                          </FormLabel>
                          <span className="text-xs text-gray-500 mt-1">Est. 1-2 business days</span>
                        </div>
                        <span className="font-medium text-[#1A1A1A]">
                          {isCalculatingShipping ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            `৳ ${calculatedShippingFee ?? 100}`
                          )}
                        </span>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors hover:border-black hover:bg-gray-50 data-[state=checked]:border-black data-[state=checked]:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="home_delivery_outside" />
                      </FormControl>
                      <div className="flex flex-1 justify-between">
                        <div className="flex flex-col">
                          <FormLabel className="cursor-pointer font-medium">
                            Home Delivery (Outside Dhaka)
                          </FormLabel>
                          <span className="text-xs text-gray-500 mt-1">Est. 3-5 business days</span>
                        </div>
                        <span className="font-medium text-[#1A1A1A]">
                          {isCalculatingShipping ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            `৳ ${calculatedShippingFee ?? 150}`
                          )}
                        </span>
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
            className="mt-6 w-full h-12 bg-[#1A1A1A] text-xs font-bold uppercase tracking-widest text-white hover:bg-black"
            onClick={() => handleNextStep("PAYMENT")}
          >
            Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Step 3: Payment */}
        <div
          className={`space-y-6 ${activeStep !== "PAYMENT" && activeStep !== "REVIEW" && "hidden"}`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment</h2>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => updateStep("SHIPPING")}
            >
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
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <RadioGroupItem value="COD" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-medium">
                        Cash on Delivery
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors hover:border-black hover:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="SSLCOMMERZ" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-medium flex items-center gap-2">
                        Cards / Mobile Banking <Image src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-03.png" alt="SSLCommerz" width={150} height={20} className="h-4 w-auto object-contain" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors hover:border-black hover:bg-gray-50">
                      <FormControl>
                        <RadioGroupItem value="BKASH" />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-medium">
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
            <h3 className="mb-4 text-lg font-medium">Billing Address</h3>
            <FormField
              control={form.control}
              name="payment.billing_address_same_as_shipping"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                  <Textarea
                    placeholder="Any special instructions?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            <span>Payments are secure and encrypted.</span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-4 w-full h-14 bg-[#1A1A1A] text-sm font-bold uppercase tracking-widest text-white hover:bg-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Order...
              </>
            ) : (
              "Complete Order"
            )}
          </Button>
        </div>
      </form>

      {/* COD Fraud Shield Verification Dialog */}
      <CodOtpDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        maskedTarget={otpTarget}
        targetType={otpTargetType}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        isVerifying={isVerifyingOtp}
        isResending={isResendingOtp}
        initialCooldown={otpCooldown}
        errorMessage={otpError}
      />
    </Form>
  );
}
