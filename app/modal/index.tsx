import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { Text } from "@/components/atoms/text";

const Modal = () => {
  const params = useLocalSearchParams<{ component: string }>();

  return (
    <ScrollView>
      <Image
        source={{
          uri: "https://siwi.org/wp-content/uploads/2021/09/colorful-water-drop-splash-e1635164525186.jpg",
        }}
        contentFit="cover"
        style={styles.image}
      />
      <View className="px-6 py-4">
        <Text className="font-integral-bold text-3xl tracking-wider">
          Modal {params.component}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#130019",
  },
});

export default Modal;
