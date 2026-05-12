import Layout from "../components/layout/Layout";

import "../components/knowledge/Knowledge.css";

import Hero from "../components/knowledge/Hero";
import Search from "../components/knowledge/Search";
import Categories from "../components/knowledge/Categories";
import ArticlesSection from "../components/articles/ArticlesSection";
import AccessCTA from "../components/knowledge/AccessCTA";

export default function KnowledgeBase() {
  return (
    <>
      <section className="knowledge-page">
        <Hero />
        <Search />
        <Categories />
        <ArticlesSection />
        <AccessCTA />
      </section>
    </>
  );
}
