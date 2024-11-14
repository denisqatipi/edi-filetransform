import { defineStore } from 'pinia'
import { api } from '../services/api'

interface Stats {
  totalTransformations: number
  transformationsThisMonth: number
  successRate: number
  processing: number
}

interface StatsState {
  stats: Stats
  loading: boolean
  error: string | null
}

export const useStatsStore = defineStore('stats', {
  state: (): StatsState => ({
    stats: {
      totalTransformations: 0,
      transformationsThisMonth: 0,
      successRate: 0,
      processing: 0
    },
    loading: false,
    error: null
  }),

  actions: {
    async fetchStats() {
      try {
        this.loading = true
        this.error = null
        this.stats = await api.getStats()
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Error fetching stats'
      } finally {
        this.loading = false
      }
    }
  }
})