import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                console.error('Error getting session:', error)
            } else {
                setSession(session)
                setUser(session?.user ?? null)
            }
            setLoading(false)
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)

                if (event === 'SIGNED_IN') {
                    toast({
                        title: "Welcome!",
                        description: "You have successfully signed in.",
                    })
                } else if (event === 'SIGNED_OUT') {
                    toast({
                        title: "Signed Out",
                        description: "You have been signed out.",
                    })
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [toast])

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (error) {
                toast({
                    title: "Sign Up Failed",
                    description: error.message,
                    variant: "destructive",
                })
                return { error }
            }

            if (data.user && !data.session) {
                toast({
                    title: "Check Your Email",
                    description: "Please check your email for a confirmation link.",
                })
            } else {
                toast({
                    title: "Sign Up Successful",
                    description: "Welcome to Smart Inventory System!",
                })
            }

            return { error: null }
        } catch (error) {
            const authError = error as AuthError
            toast({
                title: "Sign Up Failed",
                description: authError.message || "An unexpected error occurred",
                variant: "destructive",
            })
            return { error: authError }
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast({
                    title: "Sign In Failed",
                    description: error.message,
                    variant: "destructive",
                })
                return { error }
            }

            return { error: null }
        } catch (error) {
            const authError = error as AuthError
            toast({
                title: "Sign In Failed",
                description: authError.message || "An unexpected error occurred",
                variant: "destructive",
            })
            return { error: authError }
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                toast({
                    title: "Sign Out Failed",
                    description: error.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

