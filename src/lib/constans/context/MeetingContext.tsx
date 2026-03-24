"use client";
import React, { createContext, useContext, useState } from "react";
import { API_BASE_URL } from "../../../lib/constans/constans";

interface MeetingData {
  roomName: string;
  userName: string;
  isModerator: boolean;
  title: string;
  discussionId?: string | number;
  streamKey?: string;
  type: 'discussion' | 'live';
}

interface MeetingContextType {
  activeMeeting: MeetingData | null;
  isMinimized: boolean;
  startMeeting: (data: MeetingData) => void;
  endMeeting: () => Promise<void>;
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

  const endMeeting = async () => {
    if (!activeMeeting) return;

    // Logika penutupan meeting berdasarkan tipe
    if (activeMeeting.isModerator) {
      const token = localStorage.getItem('token');
      try {
        let endpoint = "";

        if (activeMeeting.type === 'discussion' && activeMeeting.discussionId) {
          endpoint = `${API_BASE_URL}/meetings/discussions/${activeMeeting.discussionId}/end-meeting`;
        } else if (activeMeeting.type === 'live') {
          endpoint = `${API_BASE_URL}/live-sessions/end-by-room/${activeMeeting.roomName}`;
        }

        if (endpoint) {
          await fetch(endpoint, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (err) {
        console.error("Gagal update status di backend:", err);
      }
    }

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