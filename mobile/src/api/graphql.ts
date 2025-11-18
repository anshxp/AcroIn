// src/api/graphql.ts
export async function fetchGraphQL(query: string, variables: any = {}) {
  try {
    const url = process.env.EXPO_PUBLIC_API_URL;
    console.log('Fetching from:', url);
    
    const response = await fetch(url!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error("❌ GraphQL fetch error:", error);
    throw error;
  }
}