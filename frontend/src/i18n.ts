import { createI18n } from "vue-i18n";

const messages = {
  FR: {
    nav: {
      dashboard: "Tableau de bord",
      history: "Historique",
      home: "Accueil",
      planning: "Planning hebdomadaire",
    },
    status: {
      title: "Votre aperçu santé",
      subtitle: "Analyse métabolique de {name}.",
      weight: "Poids",
      glucose: "Glycémie",
      calories: "Calories",
      avg: "Moyenne",
      pending: "En attente",
    },
    charts: {
      glucose: "Suivi Glycémique",
      calories: "Dépense Énergétique",
      heart: "Cœur",
      range_7d: "7 jours",
      trend: "Tendance",
    },
    table: {
      history: "Historique détaillé",
      date: "Date",
      type: "Type",
      value: "Valeur",
      action: "Action",
    },
    actions: {
      report: "Générer rapport PDF",
      cancel: "Annuler",
      confirm: "Confirmer",
      delete_title: "Supprimer ?",
      delete_desc: "Cette action est définitive.",
    },
    chat: {
      title: "Assistant HealthPulse",
      placeholder: "Posez votre question...",
      thinking: "L'IA réfléchit...",
      welcome: "Bonjour {name} ! Que puis-je faire pour vous ?",
      description:
        "Je suis votre assistant santé. Je peux analyser vos données ou répondre à vos questions bien-être.",
        confirmDeleteTitle: "Supprimer l'historique ?",
      confirmDeleteDesc: "Cette action effacera définitivement tous vos messages avec l'IA. Vous ne pourrez pas revenir en arrière.",
      cancel: "Annuler",
      confirm: "Confirmer la suppression",
      deleteTooltip: "Effacer la discussion"
    },
    theme: {
      light: "Clair",
      dark: "Sombre",
      system: "Système",
      toggle: "Changer de thème",
    },
    addRecord: {
      button: "Ajouter une mesure",
      title: "Nouvelle mesure",
      description: "Enregistrez vos données métaboliques pour un suivi précis.",
      typeLabel: "Type de mesure",
      valueLabel: "Valeur estimée",
      placeholder: "Ex: 0.95 ou 250",
      save: "Enregistrer la donnée",
      types: {
        weight: "Poids",
        heart: "Rythme Cardiaque",
        glucose: "Glycémie",
        calories: "Calories",
      },
    },
  },

  EN: {
    nav: {
      dashboard: "Dashboard",
      history: "History",
      home: "Home",
      planning: "Weekly Planning",
    },
    status: {
      title: "Your Health Overview",
      subtitle: "{name}'s metabolic analysis.",
      weight: "Weight",
      glucose: "Glucose",
      calories: "Calories",
      avg: "Average",
      pending: "Pending",
    },
    charts: {
      glucose: "Glucose Tracking",
      calories: "Energy Expenditure",
      heart: "Heart",
      range_7d: "7 days",
      trend: "Trend",
    },
    table: {
      history: "Detailed History",
      date: "Date",
      type: "Type",
      value: "Value",
      action: "Action",
    },
    actions: {
      report: "Generate PDF Report",
      cancel: "Cancel",
      confirm: "Confirm",
      delete_title: "Delete?",
      delete_desc: "This action cannot be undone.",
    },
    chat: {
      title: "HealthPulse Assistant",
      placeholder: "Ask your question...",
      thinking: "AI is thinking...",
      welcome: " Hello {name}! How can I help you today?",
      description:
        "I am your health assistant. I can analyze your data or answer your wellness questions.",
      confirmDeleteTitle: "Clear history?",
      confirmDeleteDesc: "This action will permanently delete all your messages. This cannot be undone.",
      cancel: "Cancel",
      confirm: "Confirm deletion",
      deleteTooltip: "Clear chat"
    },
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
      toggle: "Toggle theme",
    },
    addRecord: {
      button: "Add record",
      title: "New record",
      description: "Log your metabolic data for accurate tracking.",
      typeLabel: "Measurement Type",
      valueLabel: "Estimated Value",
      placeholder: "Ex: 0.95 or 250",
      save: "Save data",
      types: {
        weight: "Weight",
        heart: "Heart Rate",
        glucose: "Glucose",
        calories: "Calories",
      },
    },
  },
};

// Création de l'instance i18n
const i18n = createI18n({
  legacy: false, // Important pour utiliser useI18n() (Composition API)
  locale: localStorage.getItem("preferred_lang") || "FR", // Langue par défaut
  fallbackLocale: "EN", // Langue de secours
  messages, // On injecte tes messages ici
});

export default i18n;
