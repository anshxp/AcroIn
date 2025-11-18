"use client";

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function HomeScreen() {
  const [response, setResponse] = useState<string>("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `
          query {
            hello
          }
        `;

        const res = await fetch(process.env.EXPO_PUBLIC_API_URL!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const json = await res.json();
        console.log("✅ GraphQL connected:", json);
        setResponse(JSON.stringify(json.data));
      } catch (error) {
        console.error("❌ Connection error:", error);
        setResponse("Failed to connect to backend");
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {response === "Loading..." ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text>{response}</Text>
      )}
    </View>
  );
}
