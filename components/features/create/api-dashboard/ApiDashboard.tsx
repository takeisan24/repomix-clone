"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3Icon, TrendingUpIcon, SparklesIcon } from "lucide-react"

import { useCreatePageStore } from "@/store/createPageStore"
import { useShallow } from 'zustand/react/shallow'


/**
 * API Dashboard section component for monitoring API usage and managing keys
 * Displays API statistics, usage metrics, and key management interface
 */
export default function ApiDashboardSection() {
  // Zustand store for API stats and actions
  const { apiStats, apiKeys, onRegenerateKey, onCreateKey } = useCreatePageStore(
    useShallow((state) => ({
      apiStats: state.apiStats,
      apiKeys: state.apiKeys,
      onRegenerateKey: state.handleRegenerateKey,
      onCreateKey: state.handleCreateKey,
    }))
  )
  return (
    <div className="w-full max-w-none mx-4 mt-4">
      <h2 className="text-2xl font-bold mb-6">API Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gray-900/50 border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3Icon className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">API Calls</span>
          </div>
          <div className="text-white text-2xl font-bold">{apiStats.apiCalls.toLocaleString()}</div>
          <div className="text-sm text-green-400">+12% from last month</div>
        </Card>
        
        <Card className="bg-gray-900/50 border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUpIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Success Rate</span>
          </div>
          <div className="text-white text-2xl font-bold">{apiStats.successRate}%</div>
          <div className="text-sm text-green-400">+0.3% from last month</div>
        </Card>
        
        <Card className="bg-gray-900/50 border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Rate Limit</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {apiStats.rateLimit.used}/{apiStats.rateLimit.total}
          </div>
          <div className="text-sm text-gray-400">
            Resets in {apiStats.rateLimit.resetTime}
          </div>
        </Card>
      </div>
      
      {/* API Keys Management */}
      <Card className="bg-gray-900/50 border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">API Keys</h3>
          <Button 
            size="sm" 
            onClick={onCreateKey}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create New Key
          </Button>
        </div>
        
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div 
              key={key.id}
              className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  key.isActive ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <div>
                  <div className="font-medium text-white">{key.name}</div>
                  <div className="text-sm text-gray-400">
                    {key.type} • Last used: {key.lastUsed}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRegenerateKey(key.id)}
                  className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                >
                  Regenerate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Usage Chart Placeholder */}
      <Card className="bg-gray-900/50 border-white/10 p-4 mt-6">
        <h3 className="text-white font-semibold mb-4">Usage Over Time</h3>
        <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <BarChart3Icon className="w-12 h-12 mx-auto mb-2" />
            <p>Usage chart will be displayed here</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
