import { ClientDataPayloadType, ClientDataPayloadTypes, ClientSocketState, ClientSocketStates } from "../features/ClientSocket/ClientSocket";

export function isClientSocketState(s: string): s is ClientSocketState {
  return ClientSocketStates.includes(s);
}

export function isClientDataPayloadType(s: string): s is ClientDataPayloadType {
  return ClientDataPayloadTypes.includes(s);
}
