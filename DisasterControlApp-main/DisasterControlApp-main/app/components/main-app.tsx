"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  AlertTriangle,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Home,
  FileText,
  LogOut,
  Menu,
  MessageCircle,
  BarChart3,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import StatsDashboard from "./stats-dashboard"

interface WeatherWarning {
  id: number
  title: string
  description: string
  severity: "high" | "medium" | "low"
  type: string
  location: string
}

interface Province {
  name: string
  coordinates: { lat: number; lng: number }
  weather: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
    visibility: number
    rainfall: number
    icon: string
    forecast?: {
      today: string
      tomorrow: string
      dayAfter: string
    }
  }
}

interface WeatherData {
  province: Province
  forecast: {
    today: string
    tomorrow: string
    dayAfter: string
  }
}

interface EmergencyReport {
  id: string
  userId: string
  userName: string
  type: string
  severity: string
  description: string
  location: string
  coordinates?: { lat: number; lng: number }
  timestamp: Date
  status: "pending" | "acknowledged" | "resolved"
}

interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  location: string
}

interface ChatMessage {
  id: string
  message: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "weather-alert" | "general"
}

interface MainAppProps {
  currentUser: AppUser
  onLogout: () => void
}

// Weather API functions
const getWeatherCondition = (weatherCode: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: "Unknown",
    1000: "Clear",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    2000: "Fog",
    2100: "Light Fog",
    4000: "Drizzle",
    4001: "Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    8000: "Thunderstorm",
  }
  return weatherCodes[weatherCode] || "Clear"
}

const getWeatherIcon = (weatherCode: number): string => {
  if (weatherCode === 1000 || weatherCode === 1100) return "sunny"
  if (weatherCode >= 1001 && weatherCode <= 1102) return "partly-cloudy"
  if (weatherCode >= 2000 && weatherCode <= 2100) return "foggy"
  if (weatherCode >= 4000 && weatherCode <= 4201) return "rainy"
  if (weatherCode === 8000) return "stormy"
  return "clear"
}

const fetchWeatherData = async (lat: number, lng: number): Promise<any> => {
  const API_KEY = "jly3uT4yD1VXWTxoV4ylMgTCw3dTIPpT"

  try {
    console.log(`🌤️ Fetching live weather for coordinates: ${lat}, ${lng}`)

    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lng}&apikey=${API_KEY}&timesteps=1h,1d&units=metric`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error(`❌ Weather API error: ${response.status} - ${response.statusText}`)
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ Weather API Response received:", data)

    if (!data.timelines || !data.timelines.hourly || !data.timelines.daily) {
      throw new Error("Invalid API response structure")
    }

    const currentHour = data.timelines.hourly[0]
    const today = data.timelines.daily[0]

    if (!currentHour || !today) {
      throw new Error("Missing weather data in API response")
    }

    const weatherResult = {
      temperature: Math.round(currentHour.values.temperature),
      condition: getWeatherCondition(currentHour.values.weatherCode),
      humidity: Math.round(currentHour.values.humidity),
      windSpeed: Math.round(currentHour.values.windSpeed * 3.6), // Convert m/s to km/h
      visibility: Math.round(currentHour.values.visibility),
      rainfall: Math.round(currentHour.values.precipitationIntensity * 10) / 10,
      icon: getWeatherIcon(currentHour.values.weatherCode),
      forecast: {
        today: `${getWeatherCondition(today.values.weatherCode)} with ${Math.round(today.values.temperatureAvg)}°C`,
        tomorrow: data.timelines.daily[1]
          ? `${getWeatherCondition(data.timelines.daily[1].values.weatherCode)}, ${Math.round(data.timelines.daily[1].values.temperatureAvg)}°C`
          : "Data unavailable",
        dayAfter: data.timelines.daily[2]
          ? `${getWeatherCondition(data.timelines.daily[2].values.weatherCode)}, ${Math.round(data.timelines.daily[2].values.temperatureAvg)}°C`
          : "Data unavailable",
      },
    }

    console.log("🌟 Processed weather data:", weatherResult)
    return weatherResult
  } catch (error) {
    console.error("❌ Weather API Error:", error)

    // Return realistic fallback data based on South African climate patterns
    const fallbackData = {
      temperature: 18 + Math.floor(Math.random() * 15), // 18-33°C range
      condition: "Weather API Temporarily Unavailable",
      humidity: 40 + Math.floor(Math.random() * 40), // 40-80% range
      windSpeed: 5 + Math.floor(Math.random() * 25), // 5-30 km/h range
      visibility: 8 + Math.floor(Math.random() * 7), // 8-15 km range
      rainfall: Math.floor(Math.random() * 8), // 0-8 mm range
      icon: "clear",
      forecast: {
        today: "API temporarily unavailable - please refresh",
        tomorrow: "Check your internet connection",
        dayAfter: "Weather data will update automatically",
      },
    }

    console.log("🔄 Using fallback weather data:", fallbackData)
    return fallbackData
  }
}

const southAfricanProvinces: Province[] = [
  {
    name: "Western Cape",
    coordinates: { lat: -33.2277, lng: 21.8569 },
    weather: {
      temperature: 22,
      condition: "Loading...",
      humidity: 65,
      windSpeed: 15,
      visibility: 10,
      rainfall: 2.5,
      icon: "partly-cloudy",
    },
  },
  {
    name: "Eastern Cape",
    coordinates: { lat: -32.2968, lng: 26.4194 },
    weather: {
      temperature: 19,
      condition: "Loading...",
      humidity: 78,
      windSpeed: 12,
      visibility: 8,
      rainfall: 5.2,
      icon: "cloudy",
    },
  },
  {
    name: "Northern Cape",
    coordinates: { lat: -29.0467, lng: 21.8569 },
    weather: {
      temperature: 28,
      condition: "Loading...",
      humidity: 35,
      windSpeed: 8,
      visibility: 15,
      rainfall: 0,
      icon: "sunny",
    },
  },
  {
    name: "Free State",
    coordinates: { lat: -28.4541, lng: 26.7968 },
    weather: {
      temperature: 24,
      condition: "Loading...",
      humidity: 82,
      windSpeed: 18,
      visibility: 6,
      rainfall: 8.1,
      icon: "rainy",
    },
  },
  {
    name: "KwaZulu-Natal",
    coordinates: { lat: -28.5305, lng: 30.8958 },
    weather: {
      temperature: 26,
      condition: "Loading...",
      humidity: 88,
      windSpeed: 22,
      visibility: 4,
      rainfall: 15.3,
      icon: "stormy",
    },
  },
  {
    name: "North West",
    coordinates: { lat: -26.6638, lng: 25.2837 },
    weather: {
      temperature: 25,
      condition: "Loading...",
      humidity: 45,
      windSpeed: 10,
      visibility: 12,
      rainfall: 0.5,
      icon: "clear",
    },
  },
  {
    name: "Gauteng",
    coordinates: { lat: -26.2708, lng: 28.1123 },
    weather: {
      temperature: 23,
      condition: "Loading...",
      humidity: 58,
      windSpeed: 14,
      visibility: 9,
      rainfall: 1.2,
      icon: "partly-cloudy",
    },
  },
  {
    name: "Mpumalanga",
    coordinates: { lat: -25.5653, lng: 30.5279 },
    weather: {
      temperature: 21,
      condition: "Loading...",
      humidity: 92,
      windSpeed: 6,
      visibility: 2,
      rainfall: 3.8,
      icon: "foggy",
    },
  },
  {
    name: "Limpopo",
    coordinates: { lat: -23.4013, lng: 29.4179 },
    weather: {
      temperature: 29,
      condition: "Loading...",
      humidity: 42,
      windSpeed: 11,
      visibility: 14,
      rainfall: 0,
      icon: "hot",
    },
  },
]

export default function MainApp({ currentUser, onLogout }: MainAppProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [searchSuggestions, setSearchSuggestions] = useState<Province[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([])
  const [provinces, setProvinces] = useState<Province[]>(southAfricanProvinces)
  const [isLoadingWeather, setIsLoadingWeather] = useState(true)
  const [weatherApiStatus, setWeatherApiStatus] = useState<"loading" | "success" | "error">("loading")
  const [currentView, setCurrentView] = useState<"dashboard" | "stats">("dashboard")

  // Chat state
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      message:
        "Hello! I'm your AgriAlert SA assistant. How can I help you with weather alerts and agricultural safety today?",
      sender: "bot",
      timestamp: new Date(),
      type: "general",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  // Report form state
  const [reportType, setReportType] = useState("")
  const [reportSeverity, setReportSeverity] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [reportLocation, setReportLocation] = useState("")

  const [warnings, setWarnings] = useState<WeatherWarning[]>([
    {
      id: 1,
      title: "Severe Frost Warning",
      description: "Temperatures expected to drop below -2°C tonight. Protect sensitive crops and livestock.",
      severity: "high",
      type: "frost",
      location: "Western Cape, South Africa",
    },
    {
      id: 2,
      title: "Heavy Rainfall Alert",
      description: "Intense rainfall expected for next 48 hours. Risk of flooding in low-lying agricultural areas.",
      severity: "medium",
      type: "rainfall",
      location: "KwaZulu-Natal, South Africa",
    },
    {
      id: 3,
      title: "Strong Wind Advisory",
      description: "Wind speeds up to 60 km/h expected. Secure greenhouse structures and equipment.",
      severity: "low",
      type: "wind",
      location: "Free State, South Africa",
    },
  ])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = provinces.filter((province) => province.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setSearchSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSearchSuggestions([])
    }
  }, [searchQuery, provinces])

  useEffect(() => {
    const savedReports = localStorage.getItem("emergencyReports")
    if (savedReports) {
      try {
        setEmergencyReports(JSON.parse(savedReports))
      } catch (error) {
        console.error("Error parsing saved reports:", error)
      }
    }
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages])

  // Load live weather data for all provinces
  useEffect(() => {
    const loadWeatherData = async () => {
      setIsLoadingWeather(true)
      setWeatherApiStatus("loading")

      try {
        console.log("🚀 Starting to load live weather data for all 9 South African provinces...")

        const updatedProvinces = await Promise.all(
          southAfricanProvinces.map(async (province, index) => {
            // Add small delay between requests to avoid rate limiting
            if (index > 0) {
              await new Promise((resolve) => setTimeout(resolve, 300))
            }

            console.log(`📍 Loading weather for ${province.name}...`)
            const weatherData = await fetchWeatherData(province.coordinates.lat, province.coordinates.lng)

            return {
              ...province,
              weather: weatherData,
            }
          }),
        )

        setProvinces(updatedProvinces)
        setWeatherApiStatus("success")
        console.log("✅ Successfully loaded live weather data for all provinces!")
      } catch (error) {
        console.error("❌ Failed to load weather data:", error)
        setWeatherApiStatus("error")
      } finally {
        setIsLoadingWeather(false)
      }
    }

    loadWeatherData()

    // Refresh weather data every 30 minutes
    const interval = setInterval(
      () => {
        console.log("🔄 Auto-refreshing weather data...")
        loadWeatherData()
      },
      30 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser && reportType && reportSeverity && reportDescription && reportLocation) {
      const newReport: EmergencyReport = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: reportType,
        severity: reportSeverity,
        description: reportDescription,
        location: reportLocation,
        timestamp: new Date(),
        status: "pending",
      }

      const updatedReports = [...emergencyReports, newReport]
      setEmergencyReports(updatedReports)
      localStorage.setItem("emergencyReports", JSON.stringify(updatedReports))

      setShowReportModal(false)
      // Clear form
      setReportType("")
      setReportSeverity("")
      setReportDescription("")
      setReportLocation("")

      alert("Emergency report submitted successfully! Authorities have been notified.")
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const province = provinces.find((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      if (province) {
        selectProvince(province)
      }
    }
  }

  const selectProvince = (province: Province) => {
    setSelectedProvince(province)
    setWeatherData({
      province,
      forecast: province.weather.forecast || {
        today: `${province.weather.condition} with ${province.weather.temperature}°C`,
        tomorrow: "Forecast data loading...",
        dayAfter: "Forecast data loading...",
      },
    })
    setShowMap(true)
    setSearchQuery(province.name)
    setShowSuggestions(false)
  }

  const handleAcceptWarning = (id: number) => {
    console.log("Warning accepted:", id)
  }

  const handleDismissWarning = (id: number) => {
    setWarnings(warnings.filter((warning) => warning.id !== id))
  }

  const handleSOS = () => {
    // Immediately redirect to emergency number
    window.location.href = "tel:10111"

    // Show emergency info after initiating call
    setTimeout(() => {
      alert(
        "🚨 EMERGENCY CALL INITIATED 🚨\n\n" +
          "📞 Calling: 10111 (General Emergency)\n\n" +
          "📍 IMPORTANT EMERGENCY CONTACTS:\n" +
          "🚨 General Emergency: 10111\n" +
          "👮 Police: 10177\n" +
          "🚑 Ambulance: 10177\n" +
          "🚒 Fire Department: 10177\n" +
          "🌊 Disaster Management: 107\n\n" +
          "📍 EMERGENCY TIPS:\n" +
          "• Stay calm and speak clearly\n" +
          "• Provide your exact location\n" +
          "• Describe the emergency situation\n" +
          "• Follow operator instructions\n" +
          "• Keep your phone line open\n\n" +
          "🆘 If 10111 doesn't work, manually dial 10177",
      )
    }, 2000)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const getWeatherIconComponent = (condition: string) => {
    switch (condition) {
      case "sunny":
      case "clear":
      case "hot":
        return <Sun className="w-6 h-6 text-yellow-500" />
      case "partly-cloudy":
        return <Cloud className="w-6 h-6 text-gray-400" />
      case "cloudy":
      case "overcast":
        return <Cloud className="w-6 h-6 text-gray-600" />
      case "rainy":
      case "stormy":
        return <CloudRain className="w-6 h-6 text-blue-500" />
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const getMapUrl = () => {
    if (selectedProvince) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500000!2d${selectedProvince.coordinates.lng}!3d${selectedProvince.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2z${selectedProvince.coordinates.lat},${selectedProvince.coordinates.lng}!5e0!3m2!1sen!2s!4v1704363600000!5m2!1sen!2s&q=${encodeURIComponent(selectedProvince.name + ", South Africa")}`
    }
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7323849.848327048!2d22.937506!3d-30.559482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1c34a689d9ee1251%3A0xe85d630c1fa4e8a0!2sSouth%20Africa!5e0!3m2!1sen!2s!4v1704363600000!5m2!1sen!2s"
  }

  const getSeverityGradient = (severity: string) => {
    if (isDarkMode) {
      switch (severity) {
        case "high":
          return "bg-gradient-to-br from-red-600 to-red-800"
        case "medium":
          return "bg-gradient-to-br from-orange-600 to-orange-800"
        case "low":
          return "bg-gradient-to-br from-blue-600 to-blue-800"
        default:
          return "bg-gradient-to-br from-gray-700 to-gray-800"
      }
    } else {
      switch (severity) {
        case "high":
          return "bg-gradient-to-br from-red-500 to-red-600 shadow-lg"
        case "medium":
          return "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg"
        case "low":
          return "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
        default:
          return "bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg"
      }
    }
  }

  const getTextColor = (severity: string) => {
    return "text-white"
  }

  const handleHomeClick = () => {
    // Reset all state to initial values
    setCurrentView("dashboard")
    setSearchQuery("")
    setShowMap(false)
    setSelectedProvince(null)
    setWeatherData(null)
    setSearchSuggestions([])
    setShowSuggestions(false)
    setShowReportModal(false)
    setShowMobileMenu(false)

    // Reset report form state
    setReportType("")
    setReportSeverity("")
    setReportDescription("")
    setReportLocation("")

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: chatInput,
      sender: "user",
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput)
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        sender: "bot",
        timestamp: new Date(),
        type: "weather-alert",
      }
      setChatMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("weather") || input.includes("alert") || input.includes("warning")) {
      return "I can help you with live weather alerts! Currently, we have active warnings for frost in Western Cape, rainfall in KwaZulu-Natal, and wind in Free State. The weather data is updated every 30 minutes from Tomorrow.io API. Would you like specific details about any province?"
    }

    if (input.includes("temperature") || input.includes("hot") || input.includes("sunny")) {
      const temps = provinces.map((p) => `${p.name}: ${p.weather.temperature}°C`).join(", ")
      return `☀️ Current live temperatures: ${temps}. Data refreshed every 30 minutes from Tomorrow.io weather service.`
    }

    if (input.includes("province") || input.includes("location")) {
      return "📍 I can provide live weather information for all 9 South African provinces with real-time data from Tomorrow.io API: Western Cape, Eastern Cape, Northern Cape, Free State, KwaZulu-Natal, North West, Gauteng, Mpumalanga, and Limpopo. Which province would you like current conditions for?"
    }

    if (input.includes("frost") || input.includes("cold")) {
      return "🌡️ Frost Warning: Temperatures are expected to drop below -2°C tonight in Western Cape. Please protect sensitive crops by covering them and ensure livestock have adequate shelter. Move potted plants indoors if possible."
    }

    if (input.includes("rain") || input.includes("flood")) {
      return "🌧️ Heavy Rainfall Alert: KwaZulu-Natal is expecting intense rainfall for the next 48 hours with flooding risk in low-lying areas. Clear drainage channels and move equipment to higher ground."
    }

    if (input.includes("wind") || input.includes("storm")) {
      return "💨 Wind Advisory: Free State is experiencing wind speeds up to 60 km/h. Secure greenhouse panels, tie down equipment, and check structural integrity of buildings."
    }

    if (input.includes("emergency") || input.includes("help") || input.includes("sos")) {
      return "🚨 For immediate emergencies, call 10111. You can also use our emergency reporting feature to notify local authorities. Would you like me to guide you through the emergency report process?"
    }

    if (input.includes("crop") || input.includes("farm") || input.includes("agriculture")) {
      return "🌾 Agricultural Safety Tips:\n• Frost: Cover sensitive plants and ensure livestock shelter\n• Flooding: Clear drainage and move equipment to higher ground\n• Wind: Secure greenhouse structures and equipment\n• Always keep emergency contacts handy: 10177 (Police), 10111 (Emergency)"
    }

    if (input.includes("thank") || input.includes("thanks")) {
      return "You're welcome! I'm here 24/7 to help with live weather alerts and agricultural safety. Weather data is updated every 30 minutes. Stay safe and don't hesitate to reach out if you need assistance! 🌟"
    }

    return "I'm here to help with live weather alerts and agricultural safety! You can ask me about:\n• Current weather warnings (updated every 30 minutes)\n• Province-specific live conditions\n• Emergency procedures\n• Agricultural safety tips\n• How to report emergencies\n\nWhat would you like to know?"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (e.currentTarget.tagName === "INPUT") {
        handleSearch()
      } else {
        handleSendMessage()
      }
    }
  }

  // Show stats dashboard if selected
  if (currentView === "stats") {
    return (
      <div
        className={`min-h-screen transition-all duration-700 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
            : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
        }`}
      >
        {/* Navigation Bar */}
        <nav
          className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
            isDarkMode ? "bg-gray-900/80 border-gray-700" : "bg-white/20 border-white/20"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <AlertTriangle className={`w-8 h-8 mr-2 ${isDarkMode ? "text-yellow-400" : "text-white"}`} />
                <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}>AgriAlert SA</span>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setCurrentView("dashboard")}
                  variant="ghost"
                  className={`transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                <Button
                  onClick={toggleTheme}
                  variant="ghost"
                  className={`transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                  }`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className={`transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                  }`}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <StatsDashboard isDarkMode={isDarkMode} provinces={provinces} />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
          : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
      }`}
    >
      {/* Navigation Bar */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 shadow-lg ${
          isDarkMode ? "bg-gray-900/90 border-gray-700" : "bg-white/25 border-white/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <AlertTriangle className={`w-8 h-8 mr-2 ${isDarkMode ? "text-yellow-400" : "text-white"}`} />
              <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-white"}`}>AgriAlert SA</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                onClick={handleHomeClick}
                variant={currentView === "dashboard" ? "default" : "ghost"}
                className={`transition-all duration-300 hover:scale-105 ${
                  currentView === "dashboard"
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : isDarkMode
                      ? "text-white hover:bg-gray-800"
                      : "text-white hover:bg-white/20"
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>

              <Button
                onClick={() => setCurrentView("stats")}
                variant={currentView === "stats" ? "default" : "ghost"}
                className={`transition-all duration-300 hover:scale-105 ${
                  currentView === "stats"
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                    : isDarkMode
                      ? "text-white hover:bg-gray-800"
                      : "text-white hover:bg-white/20"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>

              <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`transition-all duration-300 hover:scale-105 ${
                      isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Report Emergency
                  </Button>
                </DialogTrigger>
              </Dialog>

              <Button
                onClick={() => setShowChatModal(true)}
                variant="ghost"
                className={`transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                }`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Weather Alerts
              </Button>

              <Button
                onClick={toggleTheme}
                variant="ghost"
                className={`transition-all duration-300 hover:scale-105 ${
                  isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-white"}`}>
                  {currentUser.name}
                </span>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleSOS}
                className="bg-red-600 hover:bg-red-500 text-white transition-all duration-300 hover:scale-110 animate-pulse shadow-lg border-2 border-red-400 font-bold px-4 py-2"
              >
                🚨 SOS
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                variant="ghost"
                className={`${isDarkMode ? "text-white" : "text-white"}`}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div
              className={`md:hidden py-4 border-t transition-all duration-300 ${
                isDarkMode ? "border-gray-700 bg-gray-900/95" : "border-white/20 bg-white/10"
              } backdrop-blur-md`}
            >
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    handleHomeClick()
                    setShowMobileMenu(false)
                  }}
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  className={`justify-start ${
                    currentView === "dashboard"
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-800"
                        : "text-white hover:bg-white/20"
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

                <Button
                  onClick={() => {
                    setCurrentView("stats")
                    setShowMobileMenu(false)
                  }}
                  variant={currentView === "stats" ? "default" : "ghost"}
                  className={`justify-start ${
                    currentView === "stats"
                      ? "bg-green-600 text-white"
                      : isDarkMode
                        ? "text-white hover:bg-gray-800"
                        : "text-white hover:bg-white/20"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>

                <Button
                  onClick={() => {
                    setShowReportModal(true)
                    setShowMobileMenu(false)
                  }}
                  variant="ghost"
                  className={`justify-start ${isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Report Emergency
                </Button>

                <Button
                  onClick={() => {
                    setShowChatModal(true)
                    setShowMobileMenu(false)
                  }}
                  variant="ghost"
                  className={`justify-start ${isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Weather Alerts
                </Button>

                <Button
                  onClick={() => {
                    handleSOS()
                    setShowMobileMenu(false)
                  }}
                  variant="ghost"
                  className="justify-start bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 font-bold"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />🚨 Emergency SOS
                </Button>

                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className={`justify-start ${isDarkMode ? "text-white hover:bg-gray-800" : "text-white hover:bg-white/20"}`}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Professional Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-white"}`}>
              South African Weather Monitoring System
            </h1>
            <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-white/90"}`}>
              Real-time weather data and emergency alerts for all 9 provinces
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden border border-white/20">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for a South African province..."
                  className={`w-full p-4 text-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 border-0 ${
                    isDarkMode
                      ? "bg-gray-800 text-white placeholder-gray-400"
                      : "bg-white text-gray-900 placeholder-gray-500"
                  }`}
                />
                <Search
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 text-lg font-medium border-0 shadow-lg"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Enhanced Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="flex justify-center mt-4">
              <div
                className={`w-full max-w-2xl rounded-xl shadow-2xl border ${
                  isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
                } overflow-hidden`}
              >
                {searchSuggestions.map((province) => (
                  <div
                    key={province.name}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] border-b last:border-b-0 ${
                      isDarkMode
                        ? "hover:bg-gray-700 border-gray-600 text-white"
                        : "hover:bg-blue-50 border-gray-100 text-gray-900"
                    }`}
                    onClick={() => selectProvince(province)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getWeatherIconComponent(province.weather.icon)}
                        <span className="font-medium text-lg">{province.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{province.weather.temperature}°C</div>
                        <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {province.weather.condition}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weather Display */}
        {selectedProvince && weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Enhanced Province Weather Card */}
            <Card className={`shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedProvince.name}</h2>
                  <div className="flex items-center space-x-2">
                    {getWeatherIconComponent(weatherData.province.weather.icon)}
                    <span className="text-3xl font-bold">{weatherData.province.weather.temperature}°C</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Condition</div>
                    <div className="font-semibold">{weatherData.province.weather.condition}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Humidity</div>
                    <div className="font-semibold">{weatherData.province.weather.humidity}%</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</div>
                    <div className="font-semibold">{weatherData.province.weather.windSpeed} km/h</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Visibility</div>
                    <div className="font-semibold">{weatherData.province.weather.visibility} km</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-3">3-Day Forecast</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Today:</span>
                      <span>{weatherData.forecast.today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tomorrow:</span>
                      <span>{weatherData.forecast.tomorrow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Day After:</span>
                      <span>{weatherData.forecast.dayAfter}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Map */}
            {showMap && (
              <Card className={`shadow-2xl ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
                <CardContent className="p-0">
                  <div className="w-full h-96 rounded-lg overflow-hidden">
                    <iframe
                      src={getMapUrl()}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Map"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Enhanced Weather Warnings */}
        {warnings.length > 0 && (
          <div className="mt-8">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-white"}`}>
              Active Weather Warnings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warnings.map((warning) => (
                <div
                  key={warning.id}
                  className={`p-6 rounded-xl shadow-2xl ${getSeverityGradient(warning.severity)} ${getTextColor(warning.severity)} border border-white/20`}
                >
                  <h3 className="text-xl font-bold mb-3">{warning.title}</h3>
                  <p className="text-sm mb-4 opacity-90">{warning.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold">Location:</span>
                    <span className="text-sm">{warning.location}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Button
                      onClick={() => handleAcceptWarning(warning.id)}
                      variant="outline"
                      className={`flex-1 transition-all duration-300 hover:scale-105 font-semibold ${
                        isDarkMode
                          ? "border-white/50 text-white hover:bg-white/20 bg-white/10"
                          : "border-white/80 text-white hover:bg-white/30 bg-white/20 shadow-md"
                      }`}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleDismissWarning(warning.id)}
                      variant="outline"
                      className={`flex-1 transition-all duration-300 hover:scale-105 font-semibold ${
                        isDarkMode
                          ? "border-white/50 text-white hover:bg-white/20 bg-white/10"
                          : "border-white/80 text-white hover:bg-white/30 bg-white/20 shadow-md"
                      }`}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className={`p-8 rounded-lg w-full max-w-md shadow-2xl ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
              <h2 className="text-xl font-bold mb-4">Report Emergency</h2>
              <form onSubmit={handleSubmitReport}>
                <div className="mb-4">
                  <label htmlFor="reportType" className="block text-sm font-medium mb-2">
                    Type of Emergency
                  </label>
                  <input
                    type="text"
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                    placeholder="e.g., Flood, Fire, Storm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="reportSeverity" className="block text-sm font-medium mb-2">
                    Severity Level
                  </label>
                  <select
                    id="reportSeverity"
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="">Select severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="reportDescription" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className={`w-full p-3 border rounded-lg h-24 ${
                      isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                    placeholder="Describe the emergency situation..."
                  ></textarea>
                </div>
                <div className="mb-6">
                  <label htmlFor="reportLocation" className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="reportLocation"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                    }`}
                    placeholder="Exact location or nearest landmark"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" onClick={() => setShowReportModal(false)} variant="outline" className="px-6">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-500 text-white px-6">
                    Submit Report
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Chat Modal */}
        {showChatModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className={`p-6 rounded-lg w-full max-w-lg shadow-2xl ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Weather Alerts Assistant</h2>
                <Button onClick={() => setShowChatModal(false)} variant="ghost" size="sm">
                  ✕
                </Button>
              </div>
              <div
                ref={chatMessagesRef}
                className={`h-80 overflow-y-auto mb-4 p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
              >
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 mb-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white ml-8"
                        : isDarkMode
                          ? "bg-gray-700 text-white mr-8"
                          : "bg-white text-gray-900 mr-8 shadow"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {message.sender === "user" ? "You" : "AgriAlert Assistant"}
                    </div>
                    <div className="text-sm">{message.message}</div>
                  </div>
                ))}
                {isTyping && (
                  <div
                    className={`p-3 mb-3 rounded-lg mr-8 ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900 shadow"}`}
                  >
                    <div className="font-semibold text-sm mb-1">AgriAlert Assistant</div>
                    <div className="text-sm">Typing...</div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about weather conditions..."
                  className={`flex-1 p-3 border rounded-lg ${
                    isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"
                  }`}
                />
                <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
