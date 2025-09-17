import React from "react";
import Hero from "@/components/Home/Hero";
import Courses from "@/components/Home/Courses";
import Mentor from "@/components/Home/Mentor";
import Testimonial from "@/components/Home/Testimonials";
import { Metadata } from "next";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
export const metadata: Metadata = {
  title: "eLearning",
};

export default function Home() {
  return (
    <main className="bg-white text-black">
      <Header />
      <Hero />
      <Courses />
      <Mentor />
      <Testimonial />
       <Footer />
    </main>
  );
}