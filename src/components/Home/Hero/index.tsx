'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play, Star, Users, Award, BookOpen, Code, Briefcase, Palette, Camera, Music, Zap } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import Link from 'next/link';

const Home = () => {
  const { t } = useTranslation();
  // Sample featured courses data
  const featuredCourses = [
    {
      id: "1",
      title: "Complete Web Development Bootcamp 2024",
      instructor: "Angela Yu",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      price: 49.99,
      originalPrice: 199.99,
      rating: 4.8,
      studentsCount: 85342,
      duration: "65 hours",
      level: "Beginner" as const,
      category: "Web Development",
      isBestseller: true,
    },
    {
      id: "2",
      title: "Machine Learning A-Z: AI & Python",
      instructor: "Kirill Eremenko",
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
      price: 0,
      rating: 4.9,
      studentsCount: 67891,
      duration: "44 hours",
      level: "Intermediate" as const,
      category: "Data Science",
      isNew: true,
    },
    {
      id: "3",
      title: "Digital Marketing Masterclass",
      instructor: "Phil Ebiner",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      price: 34.99,
      originalPrice: 149.99,
      rating: 4.7,
      studentsCount: 43567,
      duration: "28 hours",
      level: "Beginner" as const,
      category: "Marketing",
    },
    {
      id: "4",
      title: "UI/UX Design Fundamentals",
      instructor: "Daniel Walter Scott",
      thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
      price: 39.99,
      originalPrice: 179.99,
      rating: 4.6,
      studentsCount: 29834,
      duration: "32 hours",
      level: "Beginner" as const,
      category: "Design",
      isBestseller: true,
    },
  ];

  const categories = [
    { name: "Web Development", icon: Code, courses: 1250, color: "text-blue-500" },
    { name: "Business", icon: Briefcase, courses: 890, color: "text-green-500" },
    { name: "Design", icon: Palette, courses: 675, color: "text-purple-500" },
    { name: "Photography", icon: Camera, courses: 445, color: "text-orange-500" },
    { name: "Music", icon: Music, courses: 320, color: "text-pink-500" },
    { name: "Marketing", icon: Zap, courses: 580, color: "text-yellow-500" },
  ];

  const stats = [
    { icon: Users, value: "2M+", label: "Active Learners" },
    { icon: BookOpen, value: "10K+", label: "Online Courses" },
    { icon: Award, value: "500+", label: "Expert Instructors" },
    { icon: Star, value: "4.8/5", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
                  🎉 New courses every week
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  {t('home.title')}
                  <span className="block text-gradient bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                    {t('home.subtitle')}
                  </span>
                </h1>
                <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                  {t('home.description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 transition-smooth text-lg px-8">
                  {t('home.startLearning')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 transition-smooth text-lg px-8"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left text-white">
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      <stat.icon className="w-6 h-6 mr-2 text-accent" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-strong">
                {/* <img src={heroImage.src} alt="Hero" className="w-full h-auto object-cover" /> */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-medium">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.8/5 Rating</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-success text-white rounded-xl p-4 shadow-medium">
                <div className="text-center">
                  <div className="text-2xl font-bold">2M+</div>
                  <div className="text-sm">Happy Students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Explore Popular <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover courses across diverse fields and start your learning journey today
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group cursor-pointer course-card-hover bg-background border-0 shadow-soft">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-smooth`}>
                    <category.icon className={`w-8 h-8 ${category.color} group-hover:text-primary transition-smooth`} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-smooth">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.courses} courses
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Featured <span className="text-gradient">Courses</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Hand-picked courses by industry experts
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="hidden sm:flex">
                View All Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/courses">
              <Button variant="outline">
                View All Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Start Your
              <br />
              Learning Journey?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join over 2 million students and professionals who are already learning on LearnHub. 
              Start with any course and unlock your potential today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 transition-smooth text-lg px-8">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 transition-smooth text-lg px-8"
              >
                Explore Courses
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;