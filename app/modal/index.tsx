import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

import { directory } from "@/components/modals";

const Modal = () => {
  const params = useLocalSearchParams<{ component: string }>();
  const Component = directory[params.component as keyof typeof directory];

  if (!Component) return null;

  return (
    <ScrollView>
      <Component />
    </ScrollView>
  );
};

export default Modal;
