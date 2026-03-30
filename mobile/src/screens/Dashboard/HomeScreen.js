import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, Card, Avatar, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  // demo data (replace with GraphQL queries later)
  const stats = [
    { id: "s1", label: "Students", value: "2,247" },
    { id: "s2", label: "Verified", value: "2,034" },
    { id: "s3", label: "Searches", value: "89" },
    { id: "s4", label: "Opportunities", value: "34" },
  ];

  const opportunities = [
    {
      id: "o1",
      title: "CodeStorm Hackathon",
      subtitle: "Build a product in 36 hours • Team 2–4",
      tag: "Hackathon",
    },
    {
      id: "o2",
      title: "AI Research Intern",
      subtitle: "6 week stipend internship • Apply by 25 Nov",
      tag: "Internship",
    },
  ];

  const teammates = [
    { id: "t1", name: "Emma Wilson", skills: "ML • Python", initials: "EW" },
    { id: "t2", name: "John Doe", skills: "React • Node", initials: "JD" },
  ];

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      {/* Header area with small hero image on right */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.h1}>AcroIn</Text>
        </View>

        {/* Using your uploaded screenshot as a decorative hero image.
            The image file you uploaded is at:
            /mnt/data/Screenshot 2025-11-20 183000.png
            (if your environment maps that path to an asset server it will work;
             otherwise copy this file into mobile/assets and require it instead)
        */}
        <Image
          source={{ uri: "file:///mnt/data/Screenshot 2025-11-20 183000.png" }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#6B7280" />
        <TextInput
          placeholder="Search students, skills, projects..."
          placeholderTextColor="#6B7280"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.micBtn}>
          <Ionicons name="mic-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard}>
          <LinearGradient
            colors={["#E6F0FF", "#DCEBFF"]}
            style={styles.actionInner}
          >
            <Ionicons name="people-outline" size={26} color="#0B5ED7" />
            <Text style={styles.actionLabel}>Students</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <LinearGradient
            colors={["#E6F0FF", "#DCEBFF"]}
            style={styles.actionInner}
          >
            <Ionicons name="scan-outline" size={26} color="#0B5ED7" />
            <Text style={styles.actionLabel}>Face Search</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard}>
          <LinearGradient
            colors={["#E6F0FF", "#DCEBFF"]}
            style={styles.actionInner}
          >
            <Ionicons name="git-compare-outline" size={26} color="#0B5ED7" />
            <Text style={styles.actionLabel}>Smart Match</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <LinearGradient
            colors={["#E6F0FF", "#DCEBFF"]}
            style={styles.actionInner}
          >
            <Ionicons name="megaphone-outline" size={26} color="#0B5ED7" />
            <Text style={styles.actionLabel}>Opportunities</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      <Text style={styles.sectionTitle}>Stats Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <Card key={s.id} style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Opportunities horizontal list */}
      <Text style={styles.sectionTitle}>Recommended Opportunities</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {opportunities.map((op) => (
          <Card key={op.id} style={styles.opCard}>
            <Card.Content>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.opTitle}>{op.title}</Text>
                <Text style={styles.opTag}>{op.tag}</Text>
              </View>
              <Text style={styles.opSub}>{op.subtitle}</Text>
              <Button
                mode="contained"
                style={styles.opButton}
                onPress={() => { }}
                buttonColor="#0B5ED7"
              >
                View
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Recent activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Card style={styles.activityCard}>
        <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar.Icon size={44} icon="check-circle" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.activityTitle}>Emma verified her profile</Text>
            <Text style={styles.activityTime}>2 min ago</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Suggested teammates */}
      <Text style={styles.sectionTitle}>Suggested Teammates</Text>
      {teammates.map((t) => (
        <Card key={t.id} style={styles.teamCard}>
          <Card.Content style={styles.teamRow}>
            <Avatar.Text label={t.initials} size={48} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.teamName}>{t.name}</Text>
              <Text style={styles.teamSkill}>{t.skills}</Text>
            </View>
            <Button mode="contained" buttonColor="#0B5ED7">
              Connect
            </Button>
          </Card.Content>
        </Card>
      ))}

      <View style={{ height: 36 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6FAFF",
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    color: "#374151",
    fontSize: 15,
  },
  h1: {
    fontSize: 28,
    fontWeight: "800",
    color: "#072147",
  },
  heroImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: "#EAF2FF",
  },

  searchBox: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 15,
    flex: 1,
    color: "#111827",
  },
  micBtn: {
    backgroundColor: "#0B5ED7",
    padding: 8,
    borderRadius: 8,
  },

  actionsRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
  },
  actionCard: {
    width: (width - 60) / 2,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  actionInner: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  actionLabel: {
    marginLeft: 12,
    fontWeight: "700",
    color: "#072147",
    fontSize: 15,
  },

  sectionTitle: {
    marginTop: 18,
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#072147",
  },

  statsGrid: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0B5ED7",
  },
  statLabel: {
    color: "#6B7280",
  },

  horizontalScroll: {
    paddingLeft: 20,
    paddingTop: 8,
  },

  opCard: {
    width: 280,
    borderRadius: 14,
    marginRight: 14,
    paddingVertical: 6,
  },
  opTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#072147",
  },
  opTag: {
    fontWeight: "700",
    color: "#0B5ED7",
  },
  opSub: {
    marginTop: 8,
    color: "#374151",
  },
  opButton: {
    marginTop: 12,
    paddingVertical: 6,
  },

  activityCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
  },
  activityTitle: {
    fontWeight: "700",
  },
  activityTime: {
    color: "#6B7280",
    marginTop: 4,
  },

  teamCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#072147",
  },
  teamSkill: {
    color: "#6B7280",
    marginTop: 2,
  },
});
