import { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute left-4 top-4 md:left-8 md:top-8'
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we will send you instructions to reset your password.
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  )
}
