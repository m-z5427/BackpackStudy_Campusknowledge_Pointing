
import * as React from 'react';
import { TRIALS } from './constants.ts';
import { AppStep, UserResponse, PersistenceState } from './types.ts';
import { calculateAngularError } from './utils/math.ts';
import PointingCircle from './components/PointingCircle.tsx';
import ResultTable from './components/ResultTable.tsx';

const PRACTICE_COUNT = 3;
const PERSISTENCE_KEY = 'campus_knowledge_pointing_task_progress';

const App: React.FC = () => {
  const [step, setStep] = React.useState<AppStep>(AppStep.INTRO);
  const [participantId, setParticipantId] = React.useState('');
  const [currentPracticeIdx, setCurrentPracticeIdx] = React.useState(0);
  const [currentTrialIdx, setCurrentTrialIdx] = React.useState(0);
  const [currentAngle, setCurrentAngle] = React.useState(0);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [responses, setResponses] = React.useState<UserResponse[]>([]);

  // Check for existing progress on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (saved) {
      try {
        const parsed: PersistenceState = JSON.parse(saved);
        if (parsed.participantId) {
          setStep(AppStep.RESUME_PROMPT);
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Save progress whenever key state changes
  React.useEffect(() => {
    if (participantId && step !== AppStep.INTRO && step !== AppStep.RESUME_PROMPT) {
      const state: PersistenceState = {
        participantId,
        step,
        currentTrialIdx,
        currentPracticeIdx,
        responses
      };
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
    }
  }, [participantId, step, currentTrialIdx, currentPracticeIdx, responses]);

  const resumeExperiment = () => {
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (saved) {
      const parsed: PersistenceState = JSON.parse(saved);
      setParticipantId(parsed.participantId);
      setStep(parsed.step);
      setCurrentTrialIdx(parsed.currentTrialIdx);
      setCurrentPracticeIdx(parsed.currentPracticeIdx);
      setResponses(parsed.responses);
    }
  };

  const startNewExperiment = () => {
    localStorage.removeItem(PERSISTENCE_KEY);
    setParticipantId('');
    setStep(AppStep.INTRO);
    setResponses([]);
    setCurrentTrialIdx(0);
    setCurrentPracticeIdx(0);
  };

  const startPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId.trim()) return;

    // Attempt to enter fullscreen on tablet
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setStep(AppStep.PRACTICE);
    setCurrentPracticeIdx(0);
    setCurrentAngle(0);
    setHasInteracted(false);
  };

  const handleNextPractice = () => {
    if (currentPracticeIdx < PRACTICE_COUNT - 1) {
      setCurrentPracticeIdx(prev => prev + 1);
      setCurrentAngle(0);
      setHasInteracted(false);
    } else {
      setStep(AppStep.TRIAL);
      setCurrentTrialIdx(0);
      setCurrentAngle(0);
      setHasInteracted(false);
    }
  };

  const handleNextTrial = () => {
    const currentTrial = TRIALS[currentTrialIdx];
    const error = calculateAngularError(currentAngle, currentTrial.correctAngle);
    
    const response: UserResponse = {
      ...currentTrial,
      participantId,
      userAngle: currentAngle,
      error: error
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);

    if (currentTrialIdx < TRIALS.length - 1) {
      // No transition screen needed: proceed directly to the next trial.
      setCurrentTrialIdx(prev => prev + 1);
      setCurrentAngle(0);
      setHasInteracted(false);
    } else {
      setStep(AppStep.SUMMARY);
    }
  };

  const renderResumePrompt = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white overflow-hidden">
      <div className="max-w-md w-full text-center bg-white p-10 rounded-3xl shadow-2xl border border-black/10">
        <h2 className="text-3xl font-black text-black mb-4 tracking-tighter uppercase">Resume Task?</h2>
        <p className="text-black/70 mb-10">We found existing progress for a participant. Would you like to continue or start fresh?</p>
        <div className="flex flex-col gap-4">
          <button
            onClick={resumeExperiment}
            className="bg-black hover:bg-black/90 text-white font-bold py-5 px-8 rounded-2xl text-xl transition-all shadow-lg active:scale-95"
          >
            Resume Progress
          </button>
          <button
            onClick={startNewExperiment}
            className="bg-white hover:bg-black/5 text-black font-bold py-5 px-8 rounded-2xl text-xl border border-black/20 transition-all active:scale-95"
          >
            Start New Experiment
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white overflow-hidden">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-black text-black mb-6 uppercase tracking-tighter">Campus Knowledge Pointing Task</h1>
        
        <form onSubmit={startPractice} className="mb-12">
          <div className="flex flex-col items-center gap-4">
            <label htmlFor="participantId" className="text-sm font-bold text-black/60 uppercase tracking-widest">
              Enter Participant ID
            </label>
            <input
              autoFocus
              id="participantId"
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value.toUpperCase())}
              placeholder="e.g. SUB_001"
              className="w-full max-w-sm text-center text-2xl font-black py-4 px-6 border-b-4 border-black/10 focus:border-black outline-none transition-colors uppercase"
              required
            />
          </div>

          <p className="text-lg text-black/70 mt-12 mb-12 leading-relaxed max-w-lg mx-auto">
            The label in the <span className="font-bold">center of the circle</span> is the landmark you are imagined standing at. The label at the <span className="font-bold">top of the circle</span> is the landmark you are imagined facing to. Drag the arm of the circle to indicate the direction of the target landmark shown above the circle.
          </p>

          <button
            type="submit"
            className="bg-black hover:bg-black/90 text-white font-bold py-6 px-16 rounded-3xl text-2xl transition-all transform active:scale-95 shadow-2xl"
          >
            Start Experiment
          </button>
        </form>
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="min-h-screen flex flex-col p-6 bg-white overflow-hidden">
      <div className="flex flex-col items-center pt-4">
        <div className="mb-2">
           <span className="text-black font-bold uppercase tracking-widest text-sm">Practice {currentPracticeIdx + 1} of {PRACTICE_COUNT}</span>
        </div>
        
         <PointingCircle
          startingLabel="Practice Location"
          facingLabel="Practice Facing Landmark"
          targetLabel="Practice Target Landmark"
          currentAngle={currentAngle}
          onAngleChange={setCurrentAngle}
          onInteract={() => setHasInteracted(true)}
        />
      </div>

      <div className="w-full max-w-md mx-auto mt-auto mb-8">
        <button
          onClick={handleNextPractice}
          disabled={!hasInteracted}
          className={`w-full font-bold py-5 px-10 rounded-2xl text-xl transition-all shadow-xl active:scale-95 ${
            hasInteracted 
              ? 'bg-black hover:bg-black/90 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          Confirm Practice
        </button>
      </div>
    </div>
  );

  const renderTrial = () => {
    const currentTrial = TRIALS[currentTrialIdx];
    if (!currentTrial) return renderSummary();

    return (
      <div className="min-h-screen flex flex-col p-6 bg-white overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center pt-4">
          <PointingCircle
            startingLabel={currentTrial.startingLocation}
            facingLabel={currentTrial.facingLocation}
            targetLabel={currentTrial.endingLocation}
            currentAngle={currentAngle}
            onAngleChange={setCurrentAngle}
            onInteract={() => setHasInteracted(true)}
          />
        </div>

        <div className="w-full max-w-md mx-auto mt-auto mb-8">
          <button
            onClick={handleNextTrial}
            disabled={!hasInteracted}
            className={`w-full font-bold py-5 px-10 rounded-2xl text-xl transition-all shadow-xl active:scale-95 ${
              hasInteracted 
                ? 'bg-black hover:bg-black/90 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            Confirm Direction
          </button>
        </div>
      </div>
    );
  };

  const renderSummary = () => (
    <div className="min-h-screen bg-white overflow-y-auto">
      <ResultTable 
        participantId={participantId}
        responses={responses} 
        onRestart={startNewExperiment} 
      />
    </div>
  );

  switch (step) {
    case AppStep.RESUME_PROMPT: return renderResumePrompt();
    case AppStep.INTRO: return renderIntro();
    case AppStep.PRACTICE: return renderPractice();
    case AppStep.TRIAL: return renderTrial();
    case AppStep.SUMMARY: return renderSummary();
    default: return null;
  }
};

export default App;
