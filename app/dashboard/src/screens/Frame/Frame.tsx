import React, { useState } from "react";
import { DashboardSection } from "./sections/DashboardSection/DashboardSection";
import { NavigationSection } from "./sections/NavigationSection/NavigationSection";

export const Frame = (): JSX.Element => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div
      className="bg-transparent w-screen min-h-screen translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]"
      data-model-id="7905:31653"
    >
      <div className="w-full min-h-screen">
        <div className="min-h-screen bg-white overflow-hidden">
          <div className="flex w-full min-h-screen relative">
            {/* Desktop Sidebar */}
            <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] ${
              isSidebarCollapsed ? 'w-0' : 'w-[250px]'
            }`}>
              <NavigationSection 
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
                isMobile={false}
                onMobileToggle={toggleMobileSidebar}
              />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
              <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleMobileSidebar}
              />
            )}

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed left-0 top-0 h-screen w-[250px] z-50 transform transition-transform duration-300 ${
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <NavigationSection 
                isCollapsed={false}
                onToggle={toggleSidebar}
                isMobile={true}
                onMobileToggle={toggleMobileSidebar}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
              <DashboardSection 
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={toggleSidebar}
                onToggleMobileSidebar={toggleMobileSidebar}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
