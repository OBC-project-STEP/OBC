import { useState } from "react";
import "../components/knowledge/Knowledge.css";
import Hero from "../components/knowledge/Hero";
import Search from "../components/knowledge/Search";
import Categories from "../components/knowledge/Categories";
import ArticlesSection from "../components/articles/ArticlesSection";
import AccessCTA from "../components/knowledge/AccessCTA";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export default function KnowledgeBase() {
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 250);

  return (
    <section className="knowledge-page">
      <Hero />
      <Search searchQuery={searchInput} onSearchChange={setSearchInput} />
      <Categories />
      <ArticlesSection searchQuery={searchQuery} />
      <AccessCTA />
    </section>
  );
}
