'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'
import { Role } from '@/lib/rbac/matrix'

interface SessionContextType {
  user: User | null
  role: Role | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  role: null,
  isLoading: true,
})

export function SessionProvider({
  children,
  initialUser = null,
  initialRole = null,
}: {
  children: ReactNode
  initialUser?: User | null
  initialRole?: Role | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [role, setRole] = useState<Role | null>(initialRole)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const supabase = createClient()

  useEffect(() => {
    if (initialUser) return

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          // Extract role from app_metadata or default to Customer
          const userRole = (session.user.app_metadata?.role as Role) || 'Customer'
          setRole(userRole)
        } else {
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          setRole((session.user.app_metadata?.role as Role) || 'Customer')
        } else {
          setUser(null)
          setRole(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, initialUser])

  return (
    <SessionContext.Provider value={{ user, role, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = () => useContext(SessionContext)
