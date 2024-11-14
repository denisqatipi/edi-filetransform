import { defineStore } from 'pinia'

interface TransformState {
  messageIn: {
    file: File | null
    data: any
    type: string
  }
  messageOut: {
    file: File | null
    data: any
    type: string
  }
  currentStep: number
}

export const useTransformStore = defineStore('transform', {
  state: (): TransformState => ({
    messageIn: {
      file: null,
      data: null,
      type: 'XML'
    },
    messageOut: {
      file: null,
      data: null,
      type: 'JSON'
    },
    currentStep: 1
  }),

  actions: {
    setMessageIn(file: File, data: any, type: string) {
      this.messageIn = { file, data, type }
    },

    setMessageOut(file: File, data: any, type: string) {
      this.messageOut = { file, data, type }
    },

    setCurrentStep(step: number) {
      this.currentStep = step
    },

    reset() {
      this.messageIn = {
        file: null,
        data: null,
        type: 'XML'
      }
      this.messageOut = {
        file: null,
        data: null,
        type: 'JSON'
      }
      this.currentStep = 1
    }
  }
})