import { BrowserRouter, Route, Routes } from "react-router-dom"
import AdminPage from "./pages/AdminPage.jsx"
import StorePage from "./pages/StorePage.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
