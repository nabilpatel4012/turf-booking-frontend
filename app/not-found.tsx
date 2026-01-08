"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neutral-100 rounded-full blur-3xl animate-pulse opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-100 rounded-full blur-3xl animate-pulse opacity-40 delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Animated 404 text */}
        <div className="relative">
          <h1 
            className="text-[12rem] sm:text-[16rem] md:text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 to-neutral-400 leading-none select-none animate-[bounce_3s_ease-in-out_infinite]"
            style={{
              textShadow: '0 20px 40px rgba(0,0,0,0.1)',
            }}
          >
            404
          </h1>
          
          {/* Floating decorative elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full animate-[float_4s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 -right-8 w-4 h-4 bg-neutral-400 rounded-full animate-[float_3s_ease-in-out_infinite_0.5s]" />
          <div className="absolute -bottom-2 left-1/3 w-6 h-6 bg-neutral-600 rounded-full animate-[float_5s_ease-in-out_infinite_1s]" />
        </div>

        {/* Message */}
        <div className="space-y-4 animate-[fadeInUp_0.8s_ease-out_forwards]">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900">
            Uh Oh!
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-md mx-auto">
            We are not able to find what you are looking for!
          </p>
        </div>

        {/* Button */}
        <div className="animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] opacity-0">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-black hover:bg-neutral-800 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
