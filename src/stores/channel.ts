import { defineStore } from 'pinia';
import { api } from '../services/api';

interface Channel {
  id: number;
  name: string;
  description?: string;
  sourceFormat: string;
  targetFormat: string;
  sourceTemplate: any;
  targetTemplate: any;
  mappings: any[];
  created_at: string;
}

interface ChannelState {
  channels: Channel[];
  loading: boolean;
  error: string | null;
}

export const useChannelStore = defineStore('channel', {
  state: (): ChannelState => ({
    channels: [],
    loading: false,
    error: null
  }),

  getters: {
    getChannelById: (state) => (id: number) => {
      return state.channels.find(channel => channel.id === id);
    }
  },

  actions: {
    async fetchChannels() {
      try {
        this.loading = true;
        this.error = null;
        this.channels = await api.getChannels();
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Error fetching channels';
      } finally {
        this.loading = false;
      }
    },

    async createChannel(channelData: Omit<Channel, 'id' | 'created_at'>) {
      try {
        this.loading = true;
        this.error = null;
        const channel = await api.createChannel(channelData);
        this.channels.unshift(channel);
        return channel;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Error creating channel';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async transformWithChannel(channelId: number, sourceFile: any) {
      try {
        this.loading = true;
        this.error = null;
        return await api.transformWithChannel(channelId, sourceFile);
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Error during transformation';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});