'use client'

import React, { createContext, useContext, useState } from 'react'

export type UserRole = 'admin' | 'manager' | 'technician' | 'user'

interface User {
  id: string
  name: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loginAs: (role: UserRole, name: string) => void
  logout: () => void
  availableUsers: User[]
}

const AVAILABLE_USERS: User[] = [
  { id: '1', name: 'Admin User', role: 'admin', avatar: 'AU' },
  { id: '2', name: 'Manager John', role: 'manager', avatar: 'MJ' },
  { id: '3', name: 'Tech Sarah', role: 'technician', avatar: 'TS' },
  { id: '4', name: 'Regular User', role: 'user', avatar: 'RU' },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(AVAILABLE_USERS[2]) // Default to technician

  const loginAs = (role: UserRole, name: string) => {
    const selectedUser = AVAILABLE_USERS.find(
      (u) => u.role === role && u.name === name
    )
    if (selectedUser) {
      setUser(selectedUser)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        logout,
        availableUsers: AVAILABLE_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
