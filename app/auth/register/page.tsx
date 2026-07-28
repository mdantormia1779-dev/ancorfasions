import { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Create an account | Anchor Fashion',
  description: 'Join Anchor Fashion to manage your orders, wishlist, and more.',
}

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-3 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Enter your details below to create your Anchor Fashion account and get started.
        </p>
      </div>
      
      <RegisterForm />
      
      <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
      
      <p className="mt-4 px-8 text-center text-xs text-muted-foreground max-w-sm mx-auto">
        By clicking continue, you agree to our{' '}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>.
      </p>
    </>
  )
}
