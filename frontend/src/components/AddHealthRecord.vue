<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n' // <-- Import i18n
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-vue-next'

const { t } = useI18n()
const props = defineProps<{ userId: number }>()
const emit = defineEmits(['record-added'])

const isOpen = ref(false)
const isLoading = ref(false)

const form = ref({
  type: 'Poids',
  value: '',
  unit: 'kg'
})

const unitMap: Record<string, string> = {
  'Poids': 'kg',
  'BPM': 'bpm',
  'Glycémie': 'g/L',
  'Calories': 'kcal'
}

function handleTypeChange(newType: string) {
  form.value.type = newType
  form.value.unit = unitMap[newType] || ''
}

async function handleSubmit() {
  isLoading.value = true
  try {
    await api.post('/health', {
      ...form.value,
      value: parseFloat(form.value.value),
      userId: props.userId
    })
    
    isOpen.value = false
    emit('record-added')
    form.value.value = ''
  } catch (error) {
    console.error("Erreur d'ajout :", error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button class="bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-lg transition-all hover:scale-105">
        <Plus class="mr-2 h-4 w-4" /> {{ t('addRecord.button') }}
      </Button>
    </DialogTrigger>
    
    <DialogContent class="sm:max-w-106.25 rounded-[2.5rem] backdrop-blur-md p-8 shadow-sm border bg-white/50 dark:bg-slate-900/50">
      <DialogHeader>
        <DialogTitle class="text-2xl font-black">{{ t('addRecord.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('addRecord.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="grid gap-6 py-4">
        <div class="grid gap-2">
          <Label class="font-bold ml-1">{{ t('addRecord.typeLabel') }}</Label>
          <Select :model-value="form.type" @update:model-value="handleTypeChange">
            <SelectTrigger class="rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl">
              <SelectItem value="Poids">{{ t('addRecord.types.weight') }}</SelectItem>
              <SelectItem value="BPM">{{ t('addRecord.types.heart') }} (BPM)</SelectItem>
              <SelectItem value="Glycémie">{{ t('addRecord.types.glucose') }} (g/L)</SelectItem>
              <SelectItem value="Calories">{{ t('addRecord.types.calories') }} (kcal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="grid gap-2">
          <Label for="value" class="font-bold ml-1">
            {{ t('addRecord.valueLabel') }} ({{ form.unit }})
          </Label>
          <div class="relative">
            <Input 
              id="value" 
              type="number" 
              step="0.01" 
              v-model="form.value" 
              :placeholder="t('addRecord.placeholder')"
              class="rounded-xl border-slate-200 pr-12 h-12 text-lg font-semibold"
              required 
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              {{ form.unit }}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="submit" 
            :disabled="isLoading"
            class="w-full h-12 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold transition-all"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ t('addRecord.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>