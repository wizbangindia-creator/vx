import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UniversityChangePage from "./pages/UniversityChangePage";
import GermanyFairPage from "./pages/GermanyFairPage";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/university-change" element={<UniversityChangePage />} />
          <Route path="/germany-fair" element={<GermanyFairPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
