"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl lg:text-2xl text-center font-semibold tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-center text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
}

interface SuccessCardProps {
  title: string;
  message: string;
  children?: ReactNode;
  className?: string;
}

export function SuccessCard({ title, message, children, className }: SuccessCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl lg:text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          {children && (
            <div className="w-full pt-4">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
