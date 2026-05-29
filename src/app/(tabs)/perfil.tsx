import {
  AchievementCard,
  AppHeader,
  StatCard,
  RecipeCard,
} from "@/components/dashboard";
import achievementsData from "@/data/achievements.json";
import profileData from "@/data/profile.json";
import statsData from "@/data/stats.json";
import recipesData from "@/data/recipes.json";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useState } from "react";

export default function PerfilScreen() {
  const router = useRouter();
  const [section, setSection] = useState<"achievements" | "saved" | "created">(
    "achievements",
  );
  const avatarIconName = profileData.avatarIconName as React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  const { width } = useWindowDimensions();
  const containerPadding = 16; // px-4
  const gap = 16;
  const available = Math.max(0, width - containerPadding * 2);
  const itemWidth = Math.floor((available - gap) / 2);

  const handleOpenRecipe = (id: string) => {
    router.push({ pathname: "/receta/[id]", params: { id } });
  };
  return (
    <View className="flex-1 bg-[#fdf8f3]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <View className="px-4 pt-4">
          <View className="mb-4 rounded-2xl border-2 border-[#e8dfd4] bg-[#fff9f0] p-5 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="relative h-20 w-20 items-center justify-center rounded-full bg-[#d4a574]">
                <MaterialCommunityIcons
                  name={avatarIconName}
                  size={28}
                  color="#fff"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-[#5c4a3d]">
                  {profileData.name}
                </Text>
                <Text className="text-sm text-[#8b7355]">
                  {profileData.email}
                </Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color="#f9d77e"
                  />
                  <Text className="text-xs text-[#8b7355]">
                    Nivel: {profileData.level}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            className="mb-4"
            style={{ flexDirection: "row", flexWrap: "wrap" }}
          >
            <View
              style={{ width: itemWidth, marginRight: gap, marginBottom: gap }}
            >
              <StatCard
                label="Recetas Guardadas"
                value={statsData.savedRecipes}
                iconName="heart"
                backgroundClassName="bg-[#f4b8c5]/20"
              />
            </View>

            <View
              style={{ width: itemWidth, marginRight: 0, marginBottom: gap }}
            >
              <StatCard
                label="Mis Creaciones"
                value={statsData.createdRecipes}
                iconName="basket"
                backgroundClassName="bg-[#7cb69d]/20"
              />
            </View>

            <View
              style={{ width: itemWidth, marginRight: gap, marginBottom: gap }}
            >
              <StatCard
                label="Tiempo Total"
                value={`${statsData.totalTimeMinutes} min`}
                iconName="clock"
                backgroundClassName="bg-[#ffd9b3]/30"
              />
            </View>

            <View
              style={{ width: itemWidth, marginRight: 0, marginBottom: gap }}
            >
              <StatCard
                label="Nivel Chef"
                value={statsData.chefLevel}
                iconName="star"
                backgroundClassName="bg-[#f9d77e]/30"
              />
            </View>
          </View>

          <View className="mb-4 flex-row gap-2">
            <Pressable
              onPress={() => setSection("achievements")}
              className={`flex-1 rounded-xl px-3 py-2.5 ${
                section === "achievements" ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
              }`}
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={section === "achievements" ? "#ffffff" : "#f9d77e"}
                />
                <Text
                  className={`text-sm font-medium ${
                    section === "achievements" ? "text-white" : "text-[#8b7355]"
                  }`}
                >
                  Logros
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSection("saved")}
              className={`flex-1 rounded-xl px-3 py-2.5 ${
                section === "saved" ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
              }`}
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <MaterialCommunityIcons
                  name="heart"
                  size={16}
                  color={section === "saved" ? "#ffffff" : "#f4b8c5"}
                />
                <Text
                  className={`text-sm font-medium ${
                    section === "saved" ? "text-white" : "text-[#8b7355]"
                  }`}
                >
                  Guardadas
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setSection("created")}
              className={`flex-1 rounded-xl px-3 py-2.5 ${
                section === "created" ? "bg-[#7cb69d]" : "bg-[#f5ebe0]"
              }`}
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <MaterialCommunityIcons
                  name="basket"
                  size={16}
                  color={section === "created" ? "#ffffff" : "#7cb69d"}
                />
                <Text
                  className={`text-sm font-medium ${
                    section === "created" ? "text-white" : "text-[#8b7355]"
                  }`}
                >
                  Creadas
                </Text>
              </View>
            </Pressable>
          </View>

          <View className="gap-3">
            {section === "achievements" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {achievementsData.map((achievement, idx) => (
                  <View
                    key={achievement.id}
                    style={{
                      width: itemWidth,
                      marginRight: idx % 2 === 0 ? gap : 0,
                      marginBottom: gap,
                    }}
                  >
                    <AchievementCard
                      title={achievement.title}
                      description={achievement.description}
                      iconName={
                        achievement.icon as React.ComponentProps<
                          typeof MaterialCommunityIcons
                        >["name"]
                      }
                      completed={achievement.status === "complete"}
                    />
                  </View>
                ))}
              </View>
            ) : section === "saved" ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {recipesData
                  .filter((r) => r.isSaved)
                  .map((r, idx) => (
                    <View
                      key={r.id}
                      style={{
                        width: itemWidth,
                        marginRight: idx % 2 === 0 ? gap : 0,
                        marginBottom: gap,
                      }}
                    >
                      <RecipeCard
                        title={r.title}
                        imageUrl={r.imageUrl}
                        rating={r.rating}
                        timeMinutes={r.timeMinutes}
                        onPress={() => handleOpenRecipe(r.id)}
                      />
                    </View>
                  ))}
              </View>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {recipesData.filter((r) => r.isFeatured).length === 0 ? (
                  <Text className="text-sm text-[#8b7355]">
                    No hay recetas creadas aún.
                  </Text>
                ) : (
                  recipesData
                    .filter((r) => r.isFeatured)
                    .map((r, idx) => (
                      <View
                        key={r.id}
                        style={{
                          width: itemWidth,
                          marginRight: idx % 2 === 0 ? gap : 0,
                          marginBottom: gap,
                        }}
                      >
                        <RecipeCard
                          title={r.title}
                          imageUrl={r.imageUrl}
                          rating={r.rating}
                          timeMinutes={r.timeMinutes}
                          onPress={() => handleOpenRecipe(r.id)}
                        />
                      </View>
                    ))
                )}
              </View>
            )}
          </View>
          <View className="h-6" />
        </View>
      </ScrollView>
    </View>
  );
}
