import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import MenuBar from "@/components/Menubar";
import ChatRoom from "@/components/ChatRoom";

const Dashboard = async () => {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div style={{ position: 'fixed', zIndex: 999, top: '16px', left: '16px', right: '16px', bottom: '16px', display: 'flex', flexDirection: 'column' }}>
      <MenuBar />
      <ChatRoom />
    </div>
  );
};

export default Dashboard;
