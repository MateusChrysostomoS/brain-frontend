// QaList — question/answer pairs (raw conversation blocks or the
// deepening round). Each question is marked with a thin teal rule.

export type QaItem = { pergunta: string; resposta: string };

export default function QaList({ items }: { items: QaItem[] }) {
  return (
    <div className="qa">
      {items.map((item, i) => (
        <div className="qa-item" key={i}>
          <div className="qa-q">{item.pergunta}</div>
          <div className="qa-a">{item.resposta}</div>
        </div>
      ))}
    </div>
  );
}
