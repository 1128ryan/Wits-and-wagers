import { useGameStore } from './store/gameStore';
import { Lobby } from './components/Lobby';
import { QuestionPhase } from './components/QuestionPhase';
import { BettingPhase } from './components/BettingPhase';
import { ResultsPhase } from './components/ResultsPhase';
import { FinalResults } from './components/FinalResults';
import './App.css';

function App() {
  const { phase } = useGameStore();

  const renderPhase = () => {
    switch (phase) {
      case 'lobby':
        return <Lobby />;
      case 'question':
      case 'guessing':
        return <QuestionPhase />;
      case 'betting':
        return <BettingPhase />;
      case 'results':
        return <ResultsPhase />;
      case 'final':
        return <FinalResults />;
      default:
        return <Lobby />;
    }
  };

  return (
    <div className="app">
      {renderPhase()}
    </div>
  );
}

export default App;
