export type HerdrState = { readonly tick: number };

export const initialHerdrState: HerdrState = { tick: 0 };

export function advanceHerdr(state: HerdrState): HerdrState {
  return { tick: state.tick + 1 };
}
