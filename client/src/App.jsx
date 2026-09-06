import Flashcard from './Flashcard';
import './App.css';

const sampleCard = {
  question: 'What is the capital of France?',
  answer: 'Paris',
};

function App() {
  return (
    <div className="app">
      <span className="app-decor app-decor--plant" aria-hidden="true">
        🪴
      </span>
      <span className="app-decor app-decor--books" aria-hidden="true">
        📚
      </span>
      <span className="app-decor app-decor--mug" aria-hidden="true">
        ☕
      </span>
      <span className="app-decor app-decor--notes" aria-hidden="true">
        🗒️
      </span>
      <span className="app-decor app-decor--art" aria-hidden="true">
        🖼️
      </span>

      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              🐰
            </span>
            <div>
              <h1>MugBunnie Study</h1>
              <p className="brand-tagline">Small steps · brighter tomorrows</p>
            </div>
          </div>
          <div className="header-icons" aria-hidden="true">
            <span>🔍</span>
            <span>⚙️</span>
            <span>👤</span>
          </div>
        </header>

        <div className="app-body">
          <nav className="sidebar" aria-label="Main">
            <ul>
              <li className="active">Home</li>
              <li>Study</li>
              <li>Statistics</li>
              <li>Favorites</li>
              <li>Decks</li>
            </ul>
          </nav>

          <main className="study-area">
            <div className="study-toolbar">
              <span className="deck-pill">🌐 World Geography</span>
              <div className="progress" aria-label="Card 1 of 1">
                <span className="progress-label">1 of 1</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <Flashcard question={sampleCard.question} answer={sampleCard.answer} />

            <div className="study-nav">
              <button type="button" className="nav-button" disabled>
                ‹ Previous
              </button>
              <button type="button" className="nav-button" disabled>
                Next ›
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
