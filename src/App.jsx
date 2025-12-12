import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import WaterBill from "./pages/WaterBill";
import GarbageTracker from "./pages/GarbageTracker";
import NavratriManager from "./pages/NavratriManager";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/water-bill" replace />} />
          <Route path="water-bill" element={<WaterBill />} />
          <Route path="garbage-tracker" element={<GarbageTracker />} />
          <Route path="navratri-manager" element={<NavratriManager />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
