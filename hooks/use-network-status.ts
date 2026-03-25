import NetInfo from "@react-native-community/netinfo";
import { useSyncExternalStore } from "react";

let _isConnected = true;

function subscribe(cb: () => void) {
  return NetInfo.addEventListener((state) => {
    _isConnected = state.isConnected ?? true;
    cb();
  });
}

function getSnapshot() {
  return _isConnected;
}

export function useNetworkStatus() {
  const isConnected = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return { isConnected };
}
