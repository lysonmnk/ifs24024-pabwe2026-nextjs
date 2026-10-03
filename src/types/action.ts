export interface ActionPayload<T = unknown> {
  type: string;
  payload?: T;
}
