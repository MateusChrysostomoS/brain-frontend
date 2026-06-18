// StepIndicator — small pill at the top of forgot-password cards.
// Keeps the user oriented through the 3-step flow.

type StepIndicatorProps = {
  current: number;
  total: number;
};

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="step-indicator" aria-label={`Etapa ${current} de ${total}`}>
      <span className="step-dot" aria-hidden="true" />
      <span>{`Etapa ${current} de ${total}`}</span>
    </div>
  );
}
