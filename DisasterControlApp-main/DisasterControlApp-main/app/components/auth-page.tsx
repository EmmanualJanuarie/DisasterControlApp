"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertTriangle, Sun, Moon, Eye, EyeOff, MapPin, Shield, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  location: string
}

interface AuthPageProps {
  onLogin: (user: AppUser) => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerLocation, setRegisterLocation] = useState("")

  const southAfricanProvinces = [
    "Western Cape",
    "Eastern Cape",
    "Northern Cape",
    "Free State",
    "KwaZulu-Natal",
    "North West",
    "Gauteng",
    "Mpumalanga",
    "Limpopo",
  ]

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (loginEmail && loginPassword) {
      const user: AppUser = {
        id: Date.now().toString(),
        name: loginEmail.split("@")[0],
        email: loginEmail,
        phone: "+27 123 456 789",
        location: "South Africa",
      }
      onLogin(user)
    }
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (registerPassword !== registerConfirmPassword) {
      alert("Passwords do not match!")
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (registerName && registerEmail && registerPassword) {
      const user: AppUser = {
        id: Date.now().toString(),
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        location: registerLocation,
      }
      onLogin(user)
    }
    setIsLoading(false)
  }

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showLightning, setShowLightning] = useState(false)
  const [lightningPosition, setLightningPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      // Reduced chance to show lightning on mouse move
      if (Math.random() > 0.995) {
        setLightningPosition({ x: e.clientX, y: 0 })
        setShowLightning(true)
        setTimeout(() => setShowLightning(false), 300)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      className={`min-h-screen transition-all duration-700 relative overflow-hidden ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
      }`}
      style={{
        backgroundImage: isDarkMode
          ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent 40%), linear-gradient(to bottom right, #111827, #1f2937, #111827)`
          : `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.15), transparent 40%), linear-gradient(to bottom right, #3b82f6, #60a5fa, #3b82f6)`,
      }}
    >
      {/* Lightning Effect */}
      {showLightning && (
        <div
          className="fixed pointer-events-none z-10"
          style={{
            left: lightningPosition.x,
            top: 0,
            height: "100vh",
            transform: `translateX(-50%)`,
            opacity: 0.7,
          }}
        >
          <div className="lightning-bolt animate-lightning">
            <svg width="100" height="300" viewBox="0 0 100 300" className="text-yellow-300">
              <path
                d="M50 0 L30 100 L45 100 L25 300 L70 120 L55 120 L75 0 Z"
                fill="currentColor"
                className="drop-shadow-lg"
                style={{ filter: "drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))" }}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center">
          <AlertTriangle className={`w-8 h-8 mr-3 ${isDarkMode ? "text-yellow-400" : "text-white"}`} />
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}>AgriAlert SA</h1>
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>
              Agricultural Disaster Management System
            </p>
          </div>
        </div>
        <Button
          onClick={toggleTheme}
          variant="ghost"
          className={`transition-all duration-300 hover:scale-105 ${
            isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
          }`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-white"} leading-tight`}
              >
                Protect Your Farm with Real-Time Weather Alerts
              </h2>
              <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-white/90"} leading-relaxed`}>
                Join thousands of South African farmers using AgriAlert SA to stay ahead of weather disasters and
                protect their crops and livestock.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white/10"
                }`}
              >
                <Shield className={`w-8 h-8 mb-3 ${isDarkMode ? "text-blue-400" : "text-white"}`} />
                <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-white"}`}>
                  Emergency Reporting
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>
                  Report weather emergencies instantly to local authorities and get immediate assistance.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white/10"
                }`}
              >
                <MapPin className={`w-8 h-8 mb-3 ${isDarkMode ? "text-green-400" : "text-white"}`} />
                <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-white"}`}>
                  Province-Specific Alerts
                </h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>
                  Get weather warnings tailored to your specific location across all South African provinces.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white/10"
                }`}
              >
                <Zap className={`w-8 h-8 mb-3 ${isDarkMode ? "text-yellow-400" : "text-white"}`} />
                <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-white"}`}>Real-Time Updates</h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>
                  Receive instant notifications about severe weather conditions affecting your area.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "bg-gray-800/50" : "bg-white/10"
                }`}
              >
                <Users className={`w-8 h-8 mb-3 ${isDarkMode ? "text-purple-400" : "text-white"}`} />
                <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-white"}`}>Community Network</h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>
                  Connect with fellow farmers and share critical weather information in your region.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}>10K+</div>
                <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>Active Farmers</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}>9</div>
                <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>Provinces Covered</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}>24/7</div>
                <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-white/80"}`}>Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right Side - Authentication Form */}
          <div className="flex justify-center animate-slide-up">
            <Card
              className={`w-full max-w-md shadow-2xl transition-all duration-300 hover:shadow-3xl ${
                isDarkMode ? "bg-gray-800/90 border-gray-700 backdrop-blur-md" : "bg-white/95 backdrop-blur-md"
              }`}
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {isLogin ? "Welcome Back" : "Join AgriAlert SA"}
                </CardTitle>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {isLogin ? "Sign in to access your dashboard" : "Create your account to get started"}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Toggle Buttons */}
                <div
                  className={`flex rounded-lg p-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} transition-all duration-300`}
                >
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      isLogin
                        ? isDarkMode
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-blue-600 text-white shadow-md"
                        : isDarkMode
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                      !isLogin
                        ? isDarkMode
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-green-600 text-white shadow-md"
                        : isDarkMode
                          ? "text-gray-300 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Login Form */}
                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={`mt-1 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                          isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                        }`}
                        placeholder="farmer@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={`pr-10 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                            isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        "Sign In to Dashboard"
                      )}
                    </Button>
                  </form>
                ) : (
                  /* Register Form */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className={`mt-1 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className={`mt-1 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                          placeholder="+27 123 456 789"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-email" className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className={`mt-1 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                          isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                        }`}
                        placeholder="farmer@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Province
                      </Label>
                      <Select value={registerLocation} onValueChange={setRegisterLocation} required>
                        <SelectTrigger
                          className={`mt-1 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="Select your province" />
                        </SelectTrigger>
                        <SelectContent>
                          {southAfricanProvinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="register-password"
                          className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className={`pr-10 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                            }`}
                            placeholder="Create password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                              isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="confirm-password"
                          className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          className={`mt-1 transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02] ${
                            isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
                          }`}
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-white/70"}`}>
          © 2025 AgriAlert SA. Protecting South African Agriculture.
        </p>
      </div>
    </div>
  )
}
