import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/index";
import Result from "@/pages/Result/index";
import Gallery from "@/pages/Gallery/index";
import PromptLibrary from "@/pages/PromptLibrary/index";
import StyleUniverse from "@/pages/StyleUniverse/index";
import LoginPage from "@/pages/Login/index";
import TopRightMenu from "@/components/TopRightMenu/index";
import Footer from "@/components/Footer/index";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <TopRightMenu />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/prompts" element={<PromptLibrary />} />
            <Route path="/style-universe" element={<StyleUniverse />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
