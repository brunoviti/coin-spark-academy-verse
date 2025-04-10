
import { User, UserRole } from "./types";

// Mock users for demo purposes (will be used until auth is fully implemented)
export const mockUsers: Record<UserRole, User> = {
  student: {
    id: "s1",
    name: "Alex Estudiante",
    role: "student",
    avatarUrl: "/avatar-student.png",
    coins: 125,
    schoolId: "school1"
  },
  teacher: {
    id: "t1",
    name: "Prof. García",
    role: "teacher",
    avatarUrl: "/avatar-teacher.png",
    schoolId: "school1"
  },
  admin: {
    id: "a1",
    name: "Admin Escolar",
    role: "admin",
    avatarUrl: "/avatar-admin.png",
    schoolId: "school1"
  },
  super_admin: {
    id: "sa1",
    name: "Super Administrador",
    role: "super_admin",
    avatarUrl: "/avatar-admin.png"
  }
};
