import React from "react";
import { Outlet } from "react-router-dom";
export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto max-w-7xl py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold">
              RM
            </div>
            <h1 className="text-xl font-bold">ResumeMatch</h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} ResumeMatch. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
