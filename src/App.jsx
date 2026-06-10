import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ThemeProvider } from "@/context/ThemeContext";
import { retrieveUserFromLocalStorage } from "@/redux/rAuth/Actions";

import Index from "@/pages/Index";
import Login from "@/webpages/login";
import MainDash from "@/dashboard/MainDash";
import StaffDash from "@/dashboard/StaffDash";
import LeadDash from '@/dashboard/LeadDash';
import InstallationDash from "@/dashboard/InstallationDash";
import PmKusumDash from "@/dashboard/PmKusumDash";
import BlogDash from "@/dashboard/BlogDash";
import TestimonialDash from "@/dashboard/TestimonialDash";
import ProtectedRoute from "@/route/ProtectedRoute";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(retrieveUserFromLocalStorage());
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Index />} />

            <Route
              path="/login"
              element={
                isAuthenticated && user ? (
                  <Navigate
                    to={user.role === "admin" ? "/admin" : "/staff"}
                    replace
                  />
                ) : (
                  <Login />
                )
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MainDash />
                </ProtectedRoute>
              }
            />

            {/* STAFF */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["staff", "office", "service"]}>
                  <StaffDash />
                </ProtectedRoute>
              }
            />

      <Route
        path="/admin-leadboard"
        element={
          <ProtectedRoute roles={['admin', 'office']}>
            <LeadDash />
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin-installation"
        element={
          <ProtectedRoute roles={['admin', 'office', 'service','chiranjeevi']}>
            <InstallationDash />
          </ProtectedRoute>
        }
      />

      <Route
  path="/admin-pm-kusum"
  element={
    <ProtectedRoute roles={["admin", "office"]}>
      <PmKusumDash />
    </ProtectedRoute>
  }
/>

      <Route
  path="/admin-blogs"
  element={
    <ProtectedRoute roles={["admin", "office"]}>
      <BlogDash />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin-testimonials"
  element={
    <ProtectedRoute roles={["admin", "office"]}>
      <TestimonialDash />
    </ProtectedRoute>
  }
/>

      

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
