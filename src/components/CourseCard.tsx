import { Star, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from 'next/link';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

const CourseCard = ({
  id,
  title,
  instructor,
  thumbnail,
  price,
  originalPrice,
  rating,
  studentsCount,
  duration,
  level,
  category,
  isNew,
  isBestseller,
}: CourseCardProps) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Link href={`/course/${id}`} className="block">
      <Card className="group course-card-hover bg-gradient-card border-0 shadow-soft overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {isNew && (
                <Badge className="bg-success text-success-foreground">New</Badge>
              )}
              {isBestseller && (
                <Badge className="bg-accent text-accent-foreground">Bestseller</Badge>
              )}
              {discount > 0 && (
                <Badge variant="destructive">{discount}% OFF</Badge>
              )}
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                {category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-smooth">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">by {instructor}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{studentsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${
                level === "Beginner" 
                  ? "border-success text-success" 
                  : level === "Intermediate" 
                  ? "border-accent text-accent" 
                  : "border-destructive text-destructive"
              }`}
            >
              {level}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {price === 0 ? (
              <span className="text-xl font-bold text-success">Free</span>
            ) : (
              <>
                <span className="text-xl font-bold text-primary">${price}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
          <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 transition-smooth"
            onClick={(e) => e.preventDefault()} // Prevent link navigation when clicking enroll
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Enroll
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;