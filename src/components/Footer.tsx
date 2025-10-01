import { Link } from "react-router-dom";
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">LearnHub</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Transform your career with expert-led courses in technology, business, and creative skills. 
              Join millions of learners worldwide.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Learn</h3>
            <div className="space-y-3">
              <Link to="/courses" className="block text-muted-foreground hover:text-primary transition-smooth">
                All Courses
              </Link>
              <Link to="/categories" className="block text-muted-foreground hover:text-primary transition-smooth">
                Categories
              </Link>
              <Link to="/free-courses" className="block text-muted-foreground hover:text-primary transition-smooth">
                Free Courses
              </Link>
              <Link to="/certificates" className="block text-muted-foreground hover:text-primary transition-smooth">
                Certificates
              </Link>
              <Link to="/learning-paths" className="block text-muted-foreground hover:text-primary transition-smooth">
                Learning Paths
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <div className="space-y-3">
              <Link to="/help" className="block text-muted-foreground hover:text-primary transition-smooth">
                Help Center
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-smooth">
                Contact Us
              </Link>
              <Link to="/community" className="block text-muted-foreground hover:text-primary transition-smooth">
                Community
              </Link>
              <Link to="/blog" className="block text-muted-foreground hover:text-primary transition-smooth">
                Blog
              </Link>
              <Link to="/careers" className="block text-muted-foreground hover:text-primary transition-smooth">
                Careers
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-muted-foreground text-sm">
              Get the latest courses and learning tips delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email" 
                className="bg-background border-border"
              />
              <Button className="w-full bg-gradient-primary hover:opacity-90 transition-smooth">
                Subscribe
              </Button>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <Link to="/privacy" className="block hover:text-primary transition-smooth">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block hover:text-primary transition-smooth">
                Terms of Service
              </Link>
              <Link to="/cookies" className="block hover:text-primary transition-smooth">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm">
            © 2024 LearnHub. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>🌍 English</span>
            <span>💱 USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;