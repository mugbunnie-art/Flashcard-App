import { useState } from 'react';
import PropTypes from 'prop-types';
import './Flashcard.css';

// A single flashcard: shows the question, flips to reveal the answer on
// click or on Enter/Space so keyboard users can flip it too.
function Flashcard({ question, answer }) {
  const [isFlipped, setIsFlipped] = useState(false);

  function flip() {
    setIsFlipped((previous) => !previous);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flip();
    }
  }

  return (
    <div className="flashcard" role="button" tabIndex={0} onClick={flip} onKeyDown={handleKeyDown}>
      <div className={`flashcard-inner${isFlipped ? ' flashcard-inner--flipped' : ''}`}>
        <div className="flashcard-face flashcard-face--front">
          <span className="flashcard-label">Question</span>
          <span className="flashcard-text" aria-hidden={isFlipped}>
            {question}
          </span>
          <span className="flashcard-reveal" aria-hidden="true">
            <span className="flashcard-reveal-icon">👁</span>
            <span className="flashcard-reveal-text">Reveal answer</span>
          </span>
        </div>
        <div className="flashcard-face flashcard-face--back">
          <span className="flashcard-label flashcard-label--back">Answer</span>
          <span className="flashcard-text" aria-hidden={!isFlipped}>
            {answer}
          </span>
        </div>
      </div>
    </div>
  );
}

Flashcard.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
};

export default Flashcard;
