export enum ActionType {
  INSERT = 'INSERT',
  DELETE = 'DELETE',
}

export interface Step {
  type: ActionType;
  from: number;
  to: number; // For delete, this is the end. For insert, this is same as from.
  slice?: string; // Content to insert
}

export interface TrackedPosition {
  id: string;
  pos: number;
  label: string;
  color: string;
}

export interface SimulationState {
  docContent: string;
  steps: Step[];
  trackedPositions: TrackedPosition[];
}

export interface MappingResult {
  oldPos: number;
  newPos: number;
  deleted: boolean;
}