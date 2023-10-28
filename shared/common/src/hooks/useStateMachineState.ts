import { useState } from 'modules/react';

import { useSubscribe } from './useSubscribe';

import type { StateMachine } from '../models';

export function useStateMachineState<TState extends string | number, TAction extends string | number>(machine: StateMachine<TState, TAction>) {
  const [state, setState] = useState<TState>(machine.getState());

  useSubscribe(machine.state$, setState, [setState]);

  return state;
}
