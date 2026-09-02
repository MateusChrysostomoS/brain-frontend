"use client";

// PlanStep — o PRIMEIRO card do /cadastro sempre que a família do plano tem mais
// de uma faixa comprável (hoje: PreCheck Basic e Advanced).
//
// Antes deste passo o plano era o que o link trazia, e ninguém trazia escolha: a
// vitrine do PreCheck (/comecar) monta todo `checkoutHref` com
// `plan=precheck_basic` fixo, então quem chegava por lá — a maioria — assinava a
// faixa de entrada sem nunca ver que existia outra. O Advanced só era alcançável
// por quem entrasse pelo /#planos do Brain e clicasse no card certo.
//
// Vem ANTES do ContactStep por uma restrição do backend, não por gosto: o plano
// viaja no POST que cria a conta, e `PATCH /public/signup-intents/{id}` recusa
// trocá-lo depois (`plan_change_not_allowed`). Este é o último instante em que a
// escolha ainda é reversível sem refazer o cadastro — e é por isso que o botão
// "Voltar" do ContactStep some assim que o registro acontece.

import { StepHeading, StepActions } from "./WizardShell";
import type { PlanChoice } from "../lib/plans";

type PlanStepProps = {
  choices: PlanChoice[];
  selectedId: string;
  onSelect: (planId: string) => void;
  onNext: () => void;
};

export function PlanStep({ choices, selectedId, onSelect, onNext }: PlanStepProps) {
  return (
    <div>
      <StepHeading
        title="Escolha o seu plano."
        desc="Os dois trazem o PreCheck completo — a diferença é quantas pré-consultas entram por mês."
      />

      <div className="cad-plan-list">
        {choices.map((c) => {
          const on = c.planId === selectedId;
          return (
            <label key={c.planId} className={`cad-plan-card${on ? " on" : ""}`}>
              <input
                type="radio"
                name="plano"
                value={c.planId}
                checked={on}
                onChange={() => onSelect(c.planId)}
              />
              <span className="cad-plan-radio" aria-hidden="true" />
              <span className="cad-plan-body">
                <span className="cad-plan-head">
                  <span className="cad-plan-name">{c.label}</span>
                  <span className="cad-plan-price">
                    {c.amount}
                    <span className="cad-plan-unit">{c.unit}</span>
                  </span>
                </span>
                <span className="cad-plan-tagline">{c.tagline}</span>
                <ul className="cad-plan-feats">
                  {c.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </span>
            </label>
          );
        })}
      </div>

      <StepActions onNext={onNext} nextLabel="Continuar" />
    </div>
  );
}
