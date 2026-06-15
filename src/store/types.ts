import type { UiSlice } from "./slices/ui-slice";
import type { AuthSlice } from "./slices/auth-slice";

/** The composed store shape — intersection of every slice. */
export type StoreState = UiSlice & AuthSlice;
