const TONE_LABEL = { high: 'Too high', low: 'Too low' };

export default function Feedback({ feedback }) {
  if (!feedback) {
    return (
      <div className="feedback feedback--idle">
        <p className="feedback__message">No guesses yet. A good first guess splits the range in half.</p>
      </div>
    );
  }
  return (
    <div className={`feedback feedback--${feedback.result}`} key={feedback.attempt}>
      <p className="feedback__value num" aria-hidden="true">
        {feedback.value}
      </p>
      <div>
        <p className="feedback__tag">{TONE_LABEL[feedback.result]}</p>
        <p className="feedback__message">{feedback.message}</p>
      </div>
    </div>
  );
}
