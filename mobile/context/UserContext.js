// context/UserContext.jsx
import React, { createContext, useState } from "react";

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [student, setStudent] = useState(null);   // student dashboard data
  const [faculty, setFaculty] = useState(null);   // faculty dashboard data
  const [admin, setAdmin] = useState(null);       // admin dashboard data

  return (
    <UserContext.Provider value={{ student, setStudent, faculty, setFaculty, admin, setAdmin }}>
      {children}
    </UserContext.Provider>
  );
}
