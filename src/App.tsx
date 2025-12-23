import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/index";
import Result from "@/pages/Result/index";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}
