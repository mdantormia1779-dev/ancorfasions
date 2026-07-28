import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Sign In | Anchor Fashion',
  description: 'Sign in to your Anchor Fashion account.',
}

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-3 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Enter your email and password to sign in to your Anchor Fashion account.
        </p>
      </div>
      
      <LoginForm />
      
      <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
        >
          Sign up
        </Link>
      </p>
    </>
  )
}
