// Billing copy translates catalog identifiers without exposing internal names to patients or staff.
const PLAN_LABELS: Record<string, string> = {
  precheck: "PreCheck",
  precheck_start: "PreCheck Inicial",
  precheck_basic: "PreCheck Básico",
  precheck_advanced: "PreCheck Avançado",
  secretaria_basico: "secretarIA Básico",
  complete_clinic_combo: "Brain Completo",
  "brain-completo": "Brain Completo",
  free: "Gratuito",
};

const ADDON_LABELS: Record<string, string> = {
  reactivation_pack: "Contato com pacientes que não retornaram",
  verified_identity: "Identidade verificada",
  multi_professional: "Mais profissionais na clínica",
  multi_unit: "Mais unidades da clínica",
  ehr: "Prontuário eletrônico",
  pix_deposit: "Pagamento antecipado por Pix",
  analytics_bi: "Relatórios da clínica",
  analytics_bi_advanced: "Relatórios detalhados da clínica",
  human_backup_24_7: "Suporte humano a qualquer hora",
};

const LIMIT_LABELS: Record<string, string> = {
  professionals: "Profissionais na agenda",
  units: "Unidades da clínica",
  messages: "Conversas atendidas por mês",
  reminders: "Lembretes de consulta com cobrança",
  hsm_proactive: "Mensagens para retomar contato por mês",
  billable_patients: "Pacientes com cobrança",
  active_professionals: "Profissionais ativos com cobrança",
  precheck_consultations: "Pré-consultas por mês",
};

// These catalog keys are billing meters. Their zero is an uncapped quota, not zero usage or free service.
const METERED_KEYS = new Set(["billable_patients", "active_professionals", "reminders"]);

export function billingPlanLabel(plan: string, precheckPlan?: string | null): string {
  const main = PLAN_LABELS[plan] ?? "Plano contratado";
  return precheckPlan ? `${main} + ${PLAN_LABELS[precheckPlan] ?? "PreCheck"}` : main;
}

export function billingAddonLabel(id: string): string {
  return ADDON_LABELS[id] ?? "Recurso adicional contratado";
}

export function billingLimitDisplay(key: string, quantity: number): {
  label: string;
  value: string;
  hint?: string;
} {
  const label = LIMIT_LABELS[key] ?? "Recurso do plano";
  if (METERED_KEYS.has(key) && quantity === 0) {
    return { label, value: "Conforme o uso", hint: "O valor depende do uso da clínica no mês." };
  }
  return { label, value: quantity < 0 ? "Sem limite" : quantity.toLocaleString("pt-BR") };
}
