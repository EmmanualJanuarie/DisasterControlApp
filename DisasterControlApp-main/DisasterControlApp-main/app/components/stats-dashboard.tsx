"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, Users, Calendar, MapPin, ExternalLink } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface EmergencyStats {
  id: string
  province: string
  emergencyType: string
  severity: "low" | "medium" | "high" | "critical"
  date: string
  coordinates: { lat: number; lng: number }
  affectedPeople: number
  damageEstimate: number
  responseTime: number
  status: "pending" | "responding" | "resolved"
  description: string
  weatherConditions: {
    temperature: number
    humidity: number
    windSpeed: number
    rainfall: number
  }
}

interface ProvinceImpact {
  province: string
  totalIncidents: number
  totalAffected: number
  totalDamage: number
  avgResponseTime: number
  coordinates: { lat: number; lng: number }
  recentIncidents: EmergencyStats[]
  currentWeather: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
  }
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
  }
}

interface StatsDashboardProps {
  isDarkMode: boolean
  provinces: Province[]
}

export default function StatsDashboard({ isDarkMode, provinces }: StatsDashboardProps) {
  const [emergencyData, setEmergencyData] = useState<EmergencyStats[]>([])
  const [provinceImpacts, setProvinceImpacts] = useState<ProvinceImpact[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  useEffect(() => {
    const sample = getSampleData()
    setEmergencyData(sample)
    setProvinceImpacts(calculateProvinceImpacts(sample))
  }, [provinces])

  const calculateProvinceImpacts = (data: EmergencyStats[]): ProvinceImpact[] => {
    const provinceMap = new Map<string, ProvinceImpact>()

    const coords: Record<string, { lat: number; lng: number }> = {
      "Western Cape": { lat: -33.2277, lng: 21.8569 },
      "Eastern Cape": { lat: -32.2968, lng: 26.4194 },
      "Northern Cape": { lat: -29.0467, lng: 21.8569 },
      "Free State": { lat: -28.4541, lng: 26.7968 },
      "KwaZulu-Natal": { lat: -28.5305, lng: 30.8958 },
      "North West": { lat: -26.6638, lng: 25.2837 },
      Gauteng: { lat: -26.2708, lng: 28.1123 },
      Mpumalanga: { lat: -25.5653, lng: 30.5279 },
      Limpopo: { lat: -23.4013, lng: 29.4179 },
    }

    data.forEach((incident) => {
      if (!provinceMap.has(incident.province)) {
        const currentWeather = provinces.find((p) => p.name === incident.province)?.weather || {
          temperature: 20,
          condition: "Unknown",
          humidity: 50,
          windSpeed: 10,
        }

        provinceMap.set(incident.province, {
          province: incident.province,
          totalIncidents: 0,
          totalAffected: 0,
          totalDamage: 0,
          avgResponseTime: 0,
          coordinates: coords[incident.province] || { lat: 0, lng: 0 },
          recentIncidents: [],
          currentWeather: {
            temperature: currentWeather.temperature,
            condition: currentWeather.condition,
            humidity: currentWeather.humidity,
            windSpeed: currentWeather.windSpeed,
          },
        })
      }
      const p = provinceMap.get(incident.province)!
      p.totalIncidents += 1
      p.totalAffected += incident.affectedPeople
      p.totalDamage += incident.damageEstimate
      p.recentIncidents.push(incident)
    })

    provinceMap.forEach((p) => {
      const totalRT = p.recentIncidents.reduce((s, i) => s + i.responseTime, 0)
      p.avgResponseTime = Math.round(totalRT / p.totalIncidents)
    })

    return Array.from(provinceMap.values()).sort((a, b) => b.totalIncidents - a.totalIncidents)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  const getEmergencyTypeData = () => {
    const map = new Map<string, number>()
    emergencyData.forEach((e) => map.set(e.emergencyType, (map.get(e.emergencyType) ?? 0) + 1))
    return Array.from(map, ([name, value]) => ({ name, value }))
  }

  const getSeverityData = () => {
    const map = new Map<string, number>()
    emergencyData.forEach((e) => map.set(e.severity, (map.get(e.severity) ?? 0) + 1))
    return Array.from(map, ([severity, count]) => ({
      severity,
      count,
      color:
        severity === "critical"
          ? "#dc2626"
          : severity === "high"
            ? "#ea580c"
            : severity === "medium"
              ? "#d97706"
              : "#65a30d",
    }))
  }

  const getMonthlyTrends = () => {
    const map = new Map<string, { incidents: number; affected: number }>()
    emergencyData.forEach((e) => {
      const month = new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      if (!map.has(month)) map.set(month, { incidents: 0, affected: 0 })
      const m = map.get(month)!
      m.incidents += 1
      m.affected += e.affectedPeople
    })
    return Array.from(map, ([month, d]) => ({ month, ...d })).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
    )
  }

  const totalAffected = emergencyData.reduce((s, e) => s + e.affectedPeople, 0)
  const totalDamage = emergencyData.reduce((s, e) => s + e.damageEstimate, 0)

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      {/* Header & Range Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-500" />
            Emergency Response Analytics
          </h1>
          <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Real-time statistics linked to prevailing weather conditions
          </p>
        </div>

        <div className="flex space-x-2">
          {(["7d", "30d", "90d", "1y"] as const).map((r) => (
            <Button key={r} onClick={() => setTimeRange(r)} variant={timeRange === r ? "default" : "outline"} size="sm">
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          Icon={AlertTriangle}
          label="Total Incidents"
          value={emergencyData.length.toString()}
          isDarkMode={isDarkMode}
          iconColor="text-red-500"
        />
        <KpiCard
          Icon={Users}
          label="People Affected"
          value={totalAffected.toLocaleString()}
          isDarkMode={isDarkMode}
          iconColor="text-blue-500"
        />
        <KpiCard
          Icon={TrendingUp}
          label="Total Damage"
          value={`R${(totalDamage / 1_000_000).toFixed(1)} M`}
          isDarkMode={isDarkMode}
          iconColor="text-green-500"
        />
        <KpiCard
          Icon={Calendar}
          label="Avg Response Time"
          value={`${Math.round(emergencyData.reduce((s, e) => s + e.responseTime, 0) / (emergencyData.length || 1))} h`}
          isDarkMode={isDarkMode}
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Incident Trends" isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getMonthlyTrends()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#8884d8" name="Incidents" />
              <Line type="monotone" dataKey="affected" stroke="#82ca9d" name="People Affected" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Emergency Types Distribution" isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getEmergencyTypeData()}
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                dataKey="value"
              >
                {getEmergencyTypeData().map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Incident Severity Levels" isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getSeverityData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {getSeverityData().map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Impacted Provinces" isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={provinceImpacts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="province" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalIncidents" fill="#8884d8" name="Incidents" />
              <Bar dataKey="totalAffected" fill="#82ca9d" name="People Affected" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Enhanced Detailed Table with Weather Integration */}
      <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Province Emergency Details & Current Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr
                className={`border-b ${isDarkMode ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}
              >
                <th className="p-3 text-left">Province</th>
                <th className="p-3 text-left">Current Weather</th>
                <th className="p-3 text-left">Incidents</th>
                <th className="p-3 text-left">Affected</th>
                <th className="p-3 text-left">Damage (R)</th>
                <th className="p-3 text-left">Avg Resp (h)</th>
                <th className="p-3 text-left">GPS Rescue</th>
              </tr>
            </thead>
            <tbody>
              {provinceImpacts.map((p) => (
                <tr key={p.province} className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <td className="p-3 font-medium">{p.province}</td>
                  <td className="p-3">
                    <div className="text-xs">
                      <div className="font-semibold">{p.currentWeather.temperature}°C</div>
                      <div className="text-gray-500">{p.currentWeather.condition}</div>
                      <div className="text-gray-500">{p.currentWeather.humidity}% humidity</div>
                    </div>
                  </td>
                  <td className="p-3">{p.totalIncidents}</td>
                  <td className="p-3">{p.totalAffected.toLocaleString()}</td>
                  <td className="p-3">R{(p.totalDamage / 1_000_000).toFixed(1)} M</td>
                  <td className="p-3">{p.avgResponseTime}</td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${p.coordinates.lat},${p.coordinates.lng}`,
                          "_blank",
                        )
                      }
                      className="flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Rescue Teams
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({
  Icon,
  label,
  value,
  isDarkMode,
  iconColor,
}: {
  Icon: typeof AlertTriangle
  label: string
  value: string
  isDarkMode: boolean
  iconColor: string
}) {
  return (
    <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
      <CardContent className="p-6 flex items-center">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <div className="ml-4">
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  children,
  isDarkMode,
}: {
  title: string
  children: React.ReactNode
  isDarkMode: boolean
}) {
  return (
    <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function getSampleData(): EmergencyStats[] {
  return [
    {
      id: "1",
      province: "Western Cape",
      emergencyType: "Severe Drought",
      severity: "critical",
      date: "2024-12-15",
      coordinates: { lat: -33.2277, lng: 21.8569 },
      affectedPeople: 25000,
      damageEstimate: 4500000,
      responseTime: 6,
      status: "responding",
      description:
        "Extended drought conditions affecting agricultural areas – linked to high temperatures and low rainfall",
      weatherConditions: {
        temperature: 32,
        humidity: 25,
        windSpeed: 15,
        rainfall: 0,
      },
    },
    {
      id: "2",
      province: "KwaZulu-Natal",
      emergencyType: "Flash Flooding",
      severity: "critical",
      date: "2024-12-10",
      coordinates: { lat: -29.8587, lng: 31.0218 },
      affectedPeople: 35000,
      damageEstimate: 8000000,
      responseTime: 2,
      status: "resolved",
      description: "Heavy rainfall causing flash floods in coastal areas - 88% humidity, 15.3mm rainfall recorded",
      weatherConditions: {
        temperature: 26,
        humidity: 88,
        windSpeed: 22,
        rainfall: 15.3,
      },
    },
    {
      id: "3",
      province: "Free State",
      emergencyType: "Severe Hail Storm",
      severity: "high",
      date: "2024-12-08",
      coordinates: { lat: -29.1217, lng: 26.2041 },
      affectedPeople: 12000,
      damageEstimate: 2800000,
      responseTime: 4,
      status: "resolved",
      description: "Destructive hail storm with 18 km/h winds causing crop damage in agricultural regions",
      weatherConditions: {
        temperature: 24,
        humidity: 82,
        windSpeed: 18,
        rainfall: 8.1,
      },
    },
    {
      id: "4",
      province: "Gauteng",
      emergencyType: "Severe Thunderstorm",
      severity: "high",
      date: "2024-12-05",
      coordinates: { lat: -26.2041, lng: 28.0473 },
      affectedPeople: 18000,
      damageEstimate: 3200000,
      responseTime: 3,
      status: "resolved",
      description: "Intense thunderstorm with damaging winds - 14 km/h sustained winds, 58% humidity conditions",
      weatherConditions: {
        temperature: 23,
        humidity: 58,
        windSpeed: 14,
        rainfall: 1.2,
      },
    },
    {
      id: "5",
      province: "Eastern Cape",
      emergencyType: "Wildfire Emergency",
      severity: "critical",
      date: "2024-12-01",
      coordinates: { lat: -33.0117, lng: 27.9116 },
      affectedPeople: 8000,
      damageEstimate: 5500000,
      responseTime: 8,
      status: "responding",
      description: "Wildfire spreading due to low humidity (78%) and moderate winds threatening agricultural areas",
      weatherConditions: {
        temperature: 19,
        humidity: 78,
        windSpeed: 12,
        rainfall: 5.2,
      },
    },
    {
      id: "6",
      province: "Limpopo",
      emergencyType: "Heat Wave Alert",
      severity: "high",
      date: "2024-11-28",
      coordinates: { lat: -23.4013, lng: 29.4179 },
      affectedPeople: 22000,
      damageEstimate: 1800000,
      responseTime: 5,
      status: "responding",
      description: "Extreme heat conditions (29°C+) with low humidity (42%) affecting livestock and crops",
      weatherConditions: {
        temperature: 29,
        humidity: 42,
        windSpeed: 11,
        rainfall: 0,
      },
    },
    {
      id: "7",
      province: "Northern Cape",
      emergencyType: "Dust Storm",
      severity: "medium",
      date: "2024-11-25",
      coordinates: { lat: -29.0467, lng: 21.8569 },
      affectedPeople: 5000,
      damageEstimate: 800000,
      responseTime: 6,
      status: "resolved",
      description: "Severe dust storm with 8 km/h winds and high temperatures (28°C) affecting visibility",
      weatherConditions: {
        temperature: 28,
        humidity: 35,
        windSpeed: 8,
        rainfall: 0,
      },
    },
    {
      id: "8",
      province: "Mpumalanga",
      emergencyType: "Dense Fog Emergency",
      severity: "medium",
      date: "2024-11-20",
      coordinates: { lat: -25.5653, lng: 30.5279 },
      affectedPeople: 7000,
      damageEstimate: 600000,
      responseTime: 4,
      status: "resolved",
      description: "Dense fog conditions with 92% humidity and 2km visibility affecting transportation and agriculture",
      weatherConditions: {
        temperature: 21,
        humidity: 92,
        windSpeed: 6,
        rainfall: 3.8,
      },
    },
    {
      id: "9",
      province: "North West",
      emergencyType: "Wind Storm",
      severity: "medium",
      date: "2024-11-18",
      coordinates: { lat: -26.6638, lng: 25.2837 },
      affectedPeople: 9000,
      damageEstimate: 1200000,
      responseTime: 5,
      status: "resolved",
      description: "Strong wind conditions (10 km/h sustained) with moderate temperatures affecting structures",
      weatherConditions: {
        temperature: 25,
        humidity: 45,
        windSpeed: 10,
        rainfall: 0.5,
      },
    },
  ]
}
