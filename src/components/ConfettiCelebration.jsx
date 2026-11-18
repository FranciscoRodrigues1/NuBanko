import "./ConfettiCelebration.css";

const pieces = Array.from({ length: 28 }, (_, index) => index);

export default function ConfettiCelebration({ goalName, onComplete }) {
  return (
    <aside className="confetti-overlay" role="status" onAnimationEnd={(event) => event.target === event.currentTarget && onComplete()}>
      <span className="visually-hidden">Parabéns! A Caixinha {goalName} atingiu 100% da meta.</span>
      <div className="confetti-pieces" aria-hidden="true">
        {pieces.map((piece) => (
          <span
            className={`confetti-piece confetti-piece-${piece % 5}`}
            key={piece}
            style={{
              "--confetti-x": `${(piece * 37 + 13) % 100}%`,
              "--confetti-delay": `${(piece % 7) * 0.08}s`,
              "--confetti-spin": `${piece * 95}deg`,
            }}
          />
        ))}
      </div>
      <strong className="confetti-message">Meta alcançada! 🎉</strong>
    </aside>
  );
}
