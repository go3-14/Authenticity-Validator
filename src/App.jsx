import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Validate from "./pages/Validate";
import Result from "./pages/Result";
import Features from "./components/Features";
import Login from "./pages/Login";
import Register from "./pages/Register";
function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<><Home /><Features /></>} />
          <Route path="/validate" element={<Validate />} />
          <Route path="/result" element={<Result />} />
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;   // ✅ Make sure this line exists
