"use client";

import Sidebar from '@/components/Sidebar';
import ChatList from '@/components/experience/ChatList';
import ChatWindow from '@/components/experience/ChatWindow';
import RightSidebar from '@/components/experience/RightSidebar';
import DiscussionCards from '@/components/experience/DiscussionCards';

export default function Experience() {
  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">Experience</h1>
          <p className="text-slate-500 font-medium">Ini adalah ruang diskusi kamu dengan sesama pengguna lainnya.</p>
        </div>

        {/* Main Interface (Mockup Desktop) */}
        <div className="grid lg:grid-cols-12 gap-6 bg-slate-900/5 p-4 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Chat Interface Container (Mirip Gambar) */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[600px]">
            <ChatList />
            <ChatWindow />
            <RightSidebar />
          </div>

          {/* Bottom Grid Section */}
          <div className="lg:col-span-12">
            <DiscussionCards />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}