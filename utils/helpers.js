// utils/helpers.js

// Capitalize first letter
export const capitalize = (txt = "") => {
  if (!txt) return "";
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
};

// Format date nicely
export const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Trim long text (e.g., project description)
export const trimText = (text, limit = 40) => {
  if (!text) return "";
  return text.length > limit ? text.substring(0, limit) + "..." : text;
};

// Convert role to readable string
export const prettyRole = (role) => {
  return role ? role.charAt(0) + role.slice(1).toLowerCase() : "";
};
