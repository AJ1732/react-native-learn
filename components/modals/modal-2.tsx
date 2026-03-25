import { Image } from "expo-image";

import { ScrollView, StyleSheet, View } from "react-native";

import { Text } from "@/components/atoms/text";

export const Modal2 = () => {
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
          Component Modal 2
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
