
import React, { createContext } from "react";
import { AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | null>(null);
