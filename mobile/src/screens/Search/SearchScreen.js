import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, Chip, Avatar, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Computer Science");

  const students = [
    {
      id: 1,
      name: "Alex Chen",
      dept: "Computer Science",
      year: "2024",
      verified: true,
      location: "San Francisco, CA",
      skills: ["React", "Python", "Machine Learning"],
      projects: ["AI Chatbot", "E-commerce Platform"],
      rating: 4.8,
      initials: "AC",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      dept: "Data Science",
      year: "2025",
      verified: true,
      location: "Austin, TX",
      skills: ["Data Analysis", "SQL", "Tableau"],
      projects: ["Sales Dashboard", "Customer Segmentation"],
      rating: 4.6,
      initials: "SJ",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      
      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={22} color="gray" />
        <TextInput
          placeholder="Search by skills, projects..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>

      {/* Filters */}
      <Text style={styles.filterLabel}>Department</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {["Computer Science", "Data Science", "Engineering", "IT"].map((dept) => (
          <Chip
            key={dept}
            selected={selectedDept === dept}
            onPress={() => setSelectedDept(dept)}
            style={styles.chip}
            selectedColor="#1A73E8"
          >
            {dept}
          </Chip>
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Skills</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {["React", "Python", "JavaScript", "ML", "Node.js"].map((skill) => (
          <Chip key={skill} style={styles.chip}>
            {skill}
          </Chip>
        ))}
      </ScrollView>

      {/* Students List */}
      <View style={{ marginTop: 20 }}>
        {students.map((s) => (
          <Card key={s.id} style={styles.studentCard}>
            <Card.Content>
              <View style={styles.row}>
                <Avatar.Text label={s.initials} size={50} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.rowSpace}>
                    <Text style={styles.name}>{s.name}</Text>
                    {s.verified && (
                      <Ionicons name="checkmark-circle" size={20} color="#1A73E8" />
                    )}
                  </View>
                  <Text style={styles.subText}>
                    {s.dept} • Class of {s.year}
                  </Text>
                  <Text style={styles.subText}>{s.location}</Text>

                  {/* Skills Row */}
                  <View style={styles.skillsRow}>
                    {s.skills.map((skill) => (
                      <Chip key={skill} style={styles.skillChip}>
                        {skill}
                      </Chip>
                    ))}
                  </View>

                  {/* Recent Projects */}
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.projectsTitle}>Recent Projects:</Text>
                    <View style={styles.projectTags}>
                      {s.projects.map((p) => (
                        <Text key={p} style={styles.projectText}>
                          {p}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Rating + Connect */}
              <View style={styles.footerRow}>
                <Text style={styles.rating}>
                  ⭐ {s.rating}
                </Text>
                <Button mode="contained" buttonColor="#1A73E8">
                  Connect
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    marginLeft: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: "#F1F3F4",
  },
  studentCard: {
    paddingVertical: 8,
    marginBottom: 14,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
  },
  rowSpace: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  subText: {
    fontSize: 13,
    color: "gray",
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  skillChip: {
    marginRight: 6,
    marginBottom: 4,
  },
  projectsTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  projectTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  projectText: {
    color: "#1A73E8",
    fontWeight: "500",
    marginRight: 10,
    marginTop: 2,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    fontSize: 15,
    fontWeight: "700",
    color: "#444",
  },
});
