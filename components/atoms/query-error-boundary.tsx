import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "./text";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class QueryErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => {
    this.setState((prev) => (prev.hasError ? { hasError: false } : prev));
  };

  render() {
    return this.state.hasError ? (
      <View className="flex-1 items-center justify-center gap-4 bg-white p-8">
        <Text variant="muted">Something went wrong.</Text>
        <Pressable
          onPress={this.reset}
          className="rounded-full bg-neutral-100 px-6 py-3"
        >
          <Text>Try again</Text>
        </Pressable>
      </View>
    ) : (
      this.props.children
    );
  }
}
