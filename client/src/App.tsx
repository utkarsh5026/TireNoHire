import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/pages/Applayout";
import { LandingPage } from "@/components/pages/LandingPage";
import JobSeekerPage from "@/components/pages/JobSeekerPage";
import RecruiterPage from "@/components/pages/RecruiterPage";

const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="job-seeker" element={<JobSeekerPage />} />
            <Route path="recruiter" element={<RecruiterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;
