import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Validate from "./pages/Validate.jsx";
import Result from "./pages/Result.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Upload from "./pages/Upload.jsx";
import { AuthProvider } from "./context/AuthContext.js"; // Import the provider

function App() {
  return (
    // Wrap the entire application with the AuthProvider
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            {/* The ProtectedRoute component will guard all nested routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/validate" element={<Validate />} />
              <Route path="/result" element={<Result />} />
              <Route path="/upload" element={<Upload />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

