import { useState } from 'react';
import type { ApprovalRequest, ApprovalTab, DecisionKind } from '../types';

/** Dialogul de decizie deschis: ce cerere și ce decizie. */
export type DecisionTarget = { request: ApprovalRequest; kind: DecisionKind };

/** Starea locală a paginii Aprobări: tab-ul activ, dialogul de decizie și mesajul de confirmare. */
export function useApprovalsPageState() {
  const [tab, setTab] = useState<ApprovalTab>('inAsteptare');
  const [decisionTarget, setDecisionTarget] = useState<DecisionTarget>();
  const [feedback, setFeedback] = useState<string>();

  return {
    tab,
    setTab,
    decisionTarget,
    feedback,
    openDecision: (request: ApprovalRequest, kind: DecisionKind) =>
      setDecisionTarget({ request, kind }),
    closeDecision: () => setDecisionTarget(undefined),
    /** După o decizie reușită: închide dialogul și afișează unde a ajuns cererea. */
    notifyDecided: (message: string) => {
      setDecisionTarget(undefined);
      setFeedback(message);
    },
    clearFeedback: () => setFeedback(undefined),
  };
}
