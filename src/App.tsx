import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/index";
import Result from "@/pages/Result/index";
import Gallery from "@/pages/Gallery/index";
import PromptLibrary from "@/pages/PromptLibrary/index";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/prompts" element={<PromptLibrary />} />
      </Routes>
    </Router>
  );
}
