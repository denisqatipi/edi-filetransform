<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTransformStore } from '../stores/transform'
import MessageIn from '../components/MessageIn.vue'
import MessageOut from '../components/MessageOut.vue'
import XmlTreeViewer from '../components/xml/XmlTreeViewer.vue'
import JsonTreeViewer from '../components/json/JsonTreeViewer.vue'
import TransformView from '../components/transform/TransformView.vue'
import AppLogo from '../components/AppLogo.vue'

const transformStore = useTransformStore()
const currentStep = ref(transformStore.currentStep)
const totalSteps = 3
const showXmlViewer = ref(false)
const showJsonViewer = ref(false)
const uploadedFile = ref<File | null>(null)
const xmlData = ref<any>(null)
const jsonData = ref<any>(null)

const steps = [
  { 
    number: 1, 
    title: 'Message In',
    description: 'Select your input message type and file',
    icon: 'pi-file-import'
  },
  { 
    number: 2, 
    title: 'Message Out',
    description: 'Configure your output message format',
    icon: 'pi-file-export'
  },
  { 
    number: 3, 
    title: 'Transform',
    description: 'Map fields and transform your message',
    icon: 'pi-sync'
  }
]

// Initialize state from store
onMounted(() => {
  if (transformStore.messageIn.file) {
    uploadedFile.value = transformStore.messageIn.file
    xmlData.value = transformStore.messageIn.data
    showXmlViewer.value = true
  }
  
  if (transformStore.messageOut.file) {
    jsonData.value = transformStore.messageOut.data
    showJsonViewer.value = true
  }
})

const handleFileUpload = (file: File, data: any) => {
  uploadedFile.value = file
  xmlData.value = data
  showXmlViewer.value = true
  transformStore.setMessageIn(file, data, 'XML')
}

const handleJsonFileUpload = (file: File, data: any) => {
  uploadedFile.value = file
  jsonData.value = data
  showJsonViewer.value = true
  transformStore.setMessageOut(file, data, 'JSON')
}

const handleXmlSave = () => {
  showXmlViewer.value = false
  currentStep.value = 2
  transformStore.setCurrentStep(2)
}

const handleJsonSave = () => {
  showJsonViewer.value = false
  currentStep.value = 3
  transformStore.setCurrentStep(3)
}

const navigateToStep = (stepNumber: number) => {
  if (stepNumber <= currentStep.value) {
    if (stepNumber === 1) {
      // Keep XML viewer state if it was previously shown
      showJsonViewer.value = false
      if (transformStore.messageIn.file) {
        showXmlViewer.value = true
      }
    } else if (stepNumber === 2) {
      // Keep JSON viewer state if it was previously shown
      showXmlViewer.value = false
      if (transformStore.messageOut.file) {
        showJsonViewer.value = true
      }
    }
    currentStep.value = stepNumber
    transformStore.setCurrentStep(stepNumber)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/dashboard">
              <AppLogo />
            </router-link>
          </div>
          <div class="flex items-center divide-x divide-gray-200">
            <div class="px-6">
              <router-link to="/dashboard" class="nav-link">
                <i class="pi pi-home mr-1"></i>
                Dashboard
              </router-link>
            </div>
            <div class="px-6">
              <router-link to="/profile" class="nav-link">
                <i class="pi pi-user mr-1"></i>
                Profile
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-between max-w-3xl mx-auto">
          <template v-for="(step, index) in steps" :key="step.number">
            <!-- Step -->
            <div class="flex-1 relative">
              <div 
                class="flex items-center" 
                :class="{ 'opacity-50': step.number > currentStep }"
              >
                <!-- Icon Circle -->
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center relative z-10 cursor-pointer"
                  :class="[
                    step.number === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : step.number < currentStep 
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-400'
                  ]"
                  @click="navigateToStep(step.number)"
                >
                  <i :class="['pi', step.icon]"></i>
                </div>
                <!-- Title and Description -->
                <div class="ml-3">
                  <p 
                    class="text-sm font-medium"
                    :class="[
                      step.number === currentStep 
                        ? 'text-gray-900' 
                        : 'text-gray-500'
                    ]"
                  >
                    {{ step.title }}
                  </p>
                  <p class="text-xs text-gray-500">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Content -->
      <div class="card">
        <div class="border-b border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ steps[currentStep - 1].title }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ steps[currentStep - 1].description }}</p>
            </div>
            <div v-if="showXmlViewer || showJsonViewer" class="flex items-center text-sm text-gray-600">
              <i class="pi pi-file-edit mr-2"></i>
              {{ uploadedFile?.name }}
            </div>
          </div>
        </div>
        <div class="p-6">
          <MessageIn 
            v-if="currentStep === 1 && !showXmlViewer" 
            @file-uploaded="handleFileUpload" 
          />
          <XmlTreeViewer 
            v-if="showXmlViewer" 
            :data="xmlData"
            @save="handleXmlSave"
          />
          <MessageOut
            v-if="currentStep === 2 && !showJsonViewer"
            @file-uploaded="handleJsonFileUpload"
          />
          <JsonTreeViewer
            v-if="showJsonViewer"
            :data="jsonData"
            @save="handleJsonSave"
          />
          <TransformView
            v-if="currentStep === 3"
            :source-data="xmlData"
            :target-data="jsonData"
          />
        </div>
      </div>
    </main>
  </div>
</template>