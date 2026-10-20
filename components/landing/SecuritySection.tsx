// "Segurança e privacidade" — shared by / and /precheck.
//
// Only statements the product backs today. The previous version promised
// encryption at rest everywhere, storage only in Brazil, an official/Meta-
// approved WhatsApp integration, a designated DPO and auditable consent logs;
// none of that could be substantiated, so none of it is here. Add a line back
// only together with the evidence for it.

import { BrandIcon, type IconName } from "@/app/(site)/_components/BrandIcon";
import { SectionLabel } from "./brand";

const FACTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "checkCircle",
    title: "Quem decide é o médico",
    body: "O PreCheck organiza o que o paciente contou e destaca sinais de alarme. Ele não faz diagnóstico nem substitui a consulta: a avaliação é sempre do médico.",
  },
  {
    icon: "users",
    title: "Uma pessoa por perto",
    body: "A secretarIA passa a conversa para a equipe da clínica quando o assunto pede uma pessoa.",
  },
  {
    icon: "lock",
    title: "Acesso individual",
    body: "Cada pessoa da equipe entra no portal com o próprio login, por convite da clínica.",
  },
  {
    icon: "shield",
    title: "Papéis definidos na LGPD",
    body: "A clínica é a controladora dos dados dos seus pacientes. A Brain atua como operadora, tratando esses dados em nome da clínica.",
  },
];

export function SecuritySection() {
  return (
    <section id="seguranca" className="mk-section mk-section--alt" aria-labelledby="seguranca-t">
      <div className="mk-wrap mk-split">
        <div className="mk-sticky">
          <SectionLabel>Segurança e privacidade</SectionLabel>
          <h2 id="seguranca-t" className="mk-h2" style={{ marginTop: 18 }}>
            Dado de saúde é dado sensível.
          </h2>
          <p className="mk-lead" style={{ marginTop: 18 }}>
            A Brain foi pensada para a LGPD desde o início. No dia a dia da clínica, isso quer dizer
            o seguinte.
          </p>
        </div>
        <ul className="mk-facts">
          {FACTS.map((f) => (
            <li key={f.title} className="mk-fact">
              <span className="mk-fact__ico" aria-hidden="true">
                <BrandIcon name={f.icon} />
              </span>
              <div>
                <h3 className="mk-h3">{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
