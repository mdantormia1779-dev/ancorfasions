"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Role } from "@/lib/rbac/matrix";

interface SessionContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  role: null,
  isLoading: true,
});

export function SessionProvider({
  children,
  initialUser = null,
  initialRole = null,
}: {
  children: ReactNode;
  initialUser?: User | null;
  initialRole?: Role | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [role, setRole] = useState<Role | null>(initialRole);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const userRole =
            (session.user.user_metadata?.role as Role) ||
            (session.user.app_metadata?.role as Role) ||
            "Customer";
          setRole(userRole);
        } else if (!initialUser) {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        const userRole =
          (session.user.user_metadata?.role as Role) ||
          (session.user.app_metadata?.role as Role) ||
          "Customer";
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialUser]);

  return (
    <SessionContext.Provider value={{ user, role, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => useContext(SessionContext);
