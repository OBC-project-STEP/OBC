import { Outlet } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import SupportBadge from "../supportBadge/SupportBadge";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout">
      <Header />

      <main className="layout-content">
        <Outlet />
      </main>

      <Footer />

      <SupportBadge />
    </div>
  );
}
