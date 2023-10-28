import { ReplaySubject, Subject } from 'modules/rxjs';

import type { Observable } from 'modules/rxjs';

const AUTO_ACTION = '<auto>' as const;

export class StateMachine<
  TStates extends string | number,
  TActions extends string | number,
  TActionHandlers extends Record<TActions, IAnyFunction> = ISafeAny
> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  static AUTO_ACTION = AUTO_ACTION;
  state$: Observable<TStates>;
  action$: Subject<TActions>;

  private state: TStates;
  private readonly transferTable: Map<TStates, Map<TActions | typeof AUTO_ACTION, [TActionHandlers[TActions] | undefined, TStates]>>;
  private replayState$: ReplaySubject<TStates>;

  constructor(initialState: TStates) {
    this.state = initialState;
    this.transferTable = new Map();

    this.replayState$ = new ReplaySubject();
    this.state$ = this.replayState$.asObservable();
    this.action$ = new Subject();
    this.replayState$.next(initialState);
  }

  protected describe(description: string, cb: (register: typeof this.register) => void) {
    cb(this.register.bind(this));
  }

  protected register<TAction extends TActions>(
    from: TStates | TStates[],
    to: TStates,
    action: TAction | typeof AUTO_ACTION,
    handler?: TActionHandlers[TAction]
  ): void {
    if (Array.isArray(from)) {
      for (const s of from) {
        this.addTransfer(s, to, action, handler);
      }
    } else {
      this.addTransfer(from, to, action, handler);
    }
  }

  private addTransfer<TAction extends TActions>(
    from: TStates,
    to: TStates,
    action: TAction | typeof AUTO_ACTION,
    handler?: TActionHandlers[TAction]
  ): void {
    let adjTable = this.transferTable.get(from);
    if (!adjTable) {
      this.transferTable.set(from, (adjTable = new Map()));
    }

    adjTable?.set(action, [handler, to]);
  }

  dispatch<TAction extends TActions>(
    action: TAction | typeof AUTO_ACTION,
    ...args: Parameters<TActionHandlers[TAction] extends undefined ? () => ISafeAny : Exclude<TActionHandlers[TAction], undefined>>
  ): boolean {
    if (action !== AUTO_ACTION) {
      this.action$.next(action);
    }

    const actionToTransfer = this.transferTable.get(this.state);

    const transfer = actionToTransfer?.get(action);
    if (transfer === undefined) {
      return false;
    }

    const [fn, nextState] = transfer;

    if (typeof fn === 'function') {
      fn(...args);
    }

    this.state = nextState;
    this.replayState$.next(nextState);

    while (this.dispatch(AUTO_ACTION, ...args));
    return true;
  }

  getState(): TStates {
    return this.state;
  }
}
