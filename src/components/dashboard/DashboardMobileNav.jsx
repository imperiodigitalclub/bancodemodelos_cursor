import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';

const DashboardMobileNav = ({ tabs, activeTab, onTabChange }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-4 w-[280px]">
        <h3 className="text-lg font-semibold mb-4 text-pink-600 pl-4">Menu</h3>
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <SheetTrigger asChild key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-pink-600 text-white font-medium shadow-md'
                      : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-pink-600'}`} />
                  <span>{tab.label}</span>
                </button>
              </SheetTrigger>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardMobileNav;