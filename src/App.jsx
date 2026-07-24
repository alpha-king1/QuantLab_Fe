import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AnalysisProvider } from "./context/AnalysisContext ";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import Overview from "./pages/Overview";
import Statistics from "./pages/Statistics";
import MachineLearning from "./pages/MachineLearning";

function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/analysis" element={<Analysis />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/machine-learning" element={<MachineLearning />} />
        </Routes>
      </AnalysisProvider>
    </BrowserRouter>
  );
}

export default App;