<script setup lang="ts">
import { ref } from 'vue'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-vue-next'

const props = defineProps<{ userId: number }>()
const emit = defineEmits(['record-added'])

const isOpen = ref(false)
const isLoading = ref(false)

const form = ref({
  type: 'Poids',
  value: '',
  unit: 'kg'
})

async function handleSubmit() {
  isLoading.value = true
  try {
    await api.post('/health', {
      ...form.value,
      value: parseFloat(form.value.value),
      userId: props.userId
    })
    
    isOpen.value = false // Ferme la modale
    emit('record-added') // Prévient le Dashboard de se rafraîchir
    form.value.value = '' // Reset
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
      <Button class="bg-pink-600 hover:bg-pink-700 text-white">
        <Plus class="mr-2 h-4 w-4" /> Ajouter une mesure
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>Nouvelle mesure</DialogTitle>
        <DialogDescription>Enregistrez vos données de santé du jour.</DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>Type de mesure</Label>
          <Select v-model="form.type" @update:model-value="(val) => form.unit = val === 'Poids' ? 'kg' : 'BPM'">
            <SelectTrigger>
              <SelectValue placeholder="Choisir le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Poids">Poids</SelectItem>
              <SelectItem value="BPM">Rythme Cardiaque (BPM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="grid gap-2">
          <Label for="value">Valeur (en {{ form.unit }})</Label>
          <Input id="value" type="number" step="0.1" v-model="form.value" required />
        </div>

        <DialogFooter>
          <Button type="submit" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Enregistrer
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>