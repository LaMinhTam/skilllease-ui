import { Container } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import { ReactNode } from "react";
import "../styles/layout.scss";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <main className="content">
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
