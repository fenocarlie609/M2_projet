import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootComponent from "./routes/__root.jsx";
import AboutPage from "./routes/about.jsx";
import ContactPage from "./routes/contact.jsx";
import ServicesPage from "./routes/services.jsx";
import FleetPage from "./routes/flotte.jsx";
import HomePage from "./routes/index.jsx";

function NotFoundComponent() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      404 – Page non trouvée
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootComponent />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="flotte" element={<FleetPage />} />
          <Route path="*" element={<NotFoundComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
