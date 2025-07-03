"use client"

import { useState, useEffect } from "react"
import AuthPage from "./components/auth-page"
import MainApp from "./components/main-app"

interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  location: string
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading AgriAlert SA...</div>
      </div>
    )
  }

  // Show authentication page if user is not logged in
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />
  }

  // Show main app if user is authenticated
  return <MainApp currentUser={currentUser} onLogout={handleLogout} />
}
