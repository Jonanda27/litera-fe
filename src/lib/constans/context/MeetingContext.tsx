"use client";
import React, { createContext, useContext, useState } from "react";

interface MeetingData {
  roomName: string;
  userName: string;
  isModerator: boolean;
  title: string;
}

interface MeetingContextType {
  activeMeeting: MeetingData | null;
  isMinimized: boolean;
  startMeeting: (data: MeetingData) => void;
  endMeeting: () => void;
  toggleMinimize: (status: boolean) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeMeeting, setActiveMeeting] = useState<MeetingData | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const startMeeting = (data: MeetingData) => {
    setActiveMeeting(data);
    setIsMinimized(false);
  };

  const endMeeting = () => {
    setActiveMeeting(null);
    setIsMinimized(false);
  };

  const toggleMinimize = (status: boolean) => setIsMinimized(status);

  return (
    <MeetingContext.Provider value={{ activeMeeting, isMinimized, startMeeting, endMeeting, toggleMinimize }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error("useMeetingContext must be used within MeetingProvider");
  return context;
};