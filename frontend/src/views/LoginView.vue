<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  if (!email.value || !password.value) return

  isLoading.value = true
  errorMsg.value = ''

  try {
    // ✅ On tape sur la nouvelle route /auth/login
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    // ✅ On stocke le TOKEN et l'utilisateur séparément
    localStorage.setItem('access_token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    setTimeout(() => {
      router.push('/dashboard')
    }, 500)

  } catch (err: any) {
    console.error("Erreur login:", err)
    errorMsg.value = err.response?.data?.error || "Identifiants incorrects."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center dashboard-bg justify-center min-h-screen px-4">
    <Card class="w-full max-w-md shadow-lg">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">Health Track</CardTitle>
        <CardDescription class="text-center">
          Entrez votre email pour accéder à votre suivi santé
        </CardDescription>
      </CardHeader>

      <form @submit.prevent="onSubmit">
        <CardContent class="grid gap-4 my-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="nom@exemple.com" v-model="email" :disabled="isLoading"
              required />
          </div>
          <div class="grid gap-2 mb-4">
            <Label for="password">Mot de passe</Label>
            <Input id="password" type="password" v-model="password" :disabled="isLoading" required />
          </div>
          <p v-if="errorMsg" class="text-sm text-red-500 font-medium">
            {{ errorMsg }}
          </p>
        </CardContent>

        <CardFooter>
          <Button type="submit" class="w-full" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </Button>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
<style scoped>
.dashboard-bg {
  min-height: 100vh;
  /* Correction : on s'assure que le gradient est visible par dessus le fond */
  background:
    radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.15), transparent 40%),
    radial-gradient(circle at 80% 60%, rgba(244, 114, 182, 0.15), transparent 45%),
    hsl(var(--background));
  background-attachment: fixed;
}

/* Animation d'entrée pour tous les enfants du dashboard */
.dashboard-content>* {
  animation: fadeUp 0.6s ease forwards;
  opacity: 0;
  /* Commence invisible pour l'animation */
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ciblage des cartes Shadcn sans utiliser .card */
:deep(.rounded-xl) {
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

:deep(.rounded-xl:hover) {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px -10px rgba(236, 72, 153, 0.3);
}

.animate-delay-1 {
  animation-delay: 0.1s;
}

.animate-delay-2 {
  animation-delay: 0.2s;
}
</style>