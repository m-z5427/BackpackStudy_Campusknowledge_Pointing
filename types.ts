
export interface Trial {
  trialId: number;
  startingLocation: string;
  facingLocation: string; // landmark you are facing (defines "up")
  endingLocation: string; // target landmark to point to
  correctAngle: number;
}

export interface UserResponse extends Trial {
  participantId: string;
  userAngle: number;
  error: number;
}

export enum AppStep {
  INTRO = 'INTRO',
  PRACTICE = 'PRACTICE',
  TRIAL = 'TRIAL',
  TRANSITION = 'TRANSITION',
  SUMMARY = 'SUMMARY',
  RESUME_PROMPT = 'RESUME_PROMPT'
}

export interface PersistenceState {
  participantId: string;
  step: AppStep;
  currentTrialIdx: number;
  currentPracticeIdx: number;
  responses: UserResponse[];
}
