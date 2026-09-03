// Testes de planChoices/resolvePlan — a lógica que decide QUAL plano o /cadastro
// vai gravar no intent. Vale travar porque o plano é imutável depois do registro
// (`plan_change_not_allowed` no brain-api): um erro aqui não é corrigível pela
// pessoa depois, só apagando a conta.

import { describe, expect, it } from "vitest";
import { planChoices, resolvePlan, isPrecheckPlan } from "../plans";
import { PRICING, PRECHECK_QUOTA } from "../../../_lib/pricing";

function resolve(qs: string) {
  const plan = resolvePlan(new URLSearchParams(qs));
  if (!plan) throw new Error(`plano não resolvido para ${qs}`);
  return plan;
}

describe("resolvePlan", () => {
  it("resolve as três faixas do PreCheck", () => {
    expect(resolve("plan=precheck_start").planId).toBe("precheck_start");
    expect(resolve("plan=precheck_basic").planId).toBe("precheck_basic");
    expect(resolve("plan=precheck_advanced").planId).toBe("precheck_advanced");
  });

  it("mapeia o id legado 'precheck' para o Basic, não para a faixa mais barata", () => {
    // O alias existe desde o split de 2026-08-01 e significa a faixa que a conta
    // já tinha. Quando o Start entrou embaixo (2026-09-03) foi tentador reapontar
    // o legado para "a faixa de entrada" — isso rebaixaria a cota de todo link e
    // linha antiga em silêncio. Ele continua sendo o Basic, igual na brain-api
    // (catalog.LEGACY_PLAN_ALIASES).
    expect(resolve("plan=precheck").planId).toBe("precheck_basic");
  });

  it("devolve null para plano ausente ou desconhecido", () => {
    expect(resolvePlan(new URLSearchParams(""))).toBeNull();
    expect(resolvePlan(new URLSearchParams("plan=nao_existe"))).toBeNull();
    // O combo não tem checkout self-service — não pode ser resolvido nem por link.
    expect(resolvePlan(new URLSearchParams("plan=complete_clinic_combo"))).toBeNull();
  });
});

describe("planChoices", () => {
  it("oferece as três faixas do PreCheck, da menor cota para a maior", () => {
    const choices = planChoices(resolve("plan=precheck_basic"));
    expect(choices.map((c) => c.planId)).toEqual([
      "precheck_start",
      "precheck_basic",
      "precheck_advanced",
    ]);
  });

  it("mostra a mesma escolha venha o link de qual faixa vier", () => {
    const deStart = planChoices(resolve("plan=precheck_start")).map((c) => c.planId);
    const deBasic = planChoices(resolve("plan=precheck_basic")).map((c) => c.planId);
    const deAdvanced = planChoices(resolve("plan=precheck_advanced")).map((c) => c.planId);
    expect(deBasic).toEqual(deAdvanced);
    expect(deStart).toEqual(deBasic);
  });

  it("não inventa escolha quando a família tem uma faixa só", () => {
    // secretarIA tem um plano comprável — uma lista de um item não é decisão, e o
    // wizard tem de pular o passo inteiro.
    expect(planChoices(resolve("plan=secretaria_basico"))).toEqual([]);
  });

  it("herda os add-ons do ?catalog= em toda alternativa", () => {
    // Trocar de FAIXA não pode descartar em silêncio um add-on que o link trazia:
    // seria uma cobrança a menos que ninguém veria.
    const comAddon = resolve("plan=precheck_basic&catalog=precheck_basic,pix_deposit");
    for (const c of planChoices(comAddon)) {
      expect(c.catalogIds[0]).toBe(c.planId);
      expect(c.catalogIds).toContain("pix_deposit");
      // e nunca a OUTRA faixa junto — exatamente um plano por seleção.
      expect(c.catalogIds.filter((id) => id.startsWith("precheck_"))).toEqual([c.planId]);
    }
  });

  it("mostra preço e bullets vindos da vitrine, sem redigitar", () => {
    const [start, basic, advanced] = planChoices(resolve("plan=precheck_basic"));
    expect(start.amount).toBe(PRICING.precheckStart.amount);
    expect(start.features).toEqual(PRICING.precheckStart.features);
    expect(basic.amount).toBe(PRICING.precheck.amount);
    expect(basic.features).toEqual(PRICING.precheck.features);
    expect(advanced.amount).toBe(PRICING.precheckAdvanced.amount);
    expect(advanced.features).toEqual(PRICING.precheckAdvanced.features);
  });

  it("anuncia a cota que vem de PRECHECK_QUOTA, não um número redigitado", () => {
    // A divergência que isto trava: por um mês a vitrine prometeu 50/150 enquanto
    // a brain-api concedia 100/300, porque o número estava escrito à mão no JSX.
    // Se alguém redigitar a cota em vez de mudar PRECHECK_QUOTA, este teste cai.
    const [start, basic, advanced] = planChoices(resolve("plan=precheck_basic"));
    expect(start.features[0]).toBe(`${PRECHECK_QUOTA.start} pré-consultas por mês`);
    expect(basic.features[0]).toBe(`${PRECHECK_QUOTA.basic} pré-consultas por mês`);
    expect(advanced.features[0]).toBe(`${PRECHECK_QUOTA.advanced} pré-consultas por mês`);
    // e a escada tem de subir de verdade, senão não são faixas.
    expect(PRECHECK_QUOTA.basic).toBeGreaterThan(PRECHECK_QUOTA.start);
    expect(PRECHECK_QUOTA.advanced).toBeGreaterThan(PRECHECK_QUOTA.basic);
  });

  it("toda alternativa continua sendo PreCheck", () => {
    for (const c of planChoices(resolve("plan=precheck_basic"))) {
      expect(isPrecheckPlan(c)).toBe(true);
    }
  });
});
