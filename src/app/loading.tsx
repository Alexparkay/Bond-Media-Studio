"use client";

import { FrameworkSelector } from "@/components/framework-selector";
import { PromptInput, PromptInputTextarea } from "@/components/ui/prompt-input";
import { ExampleButton } from "@/components/ExampleButton";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-48 h-8 bg-white/10 rounded animate-pulse" />
          <div className="w-24 h-8 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center mt-16 sm:mt-24 md:mt-32">
          <div className="w-full max-w-2xl space-y-4 mb-8">
            <div className="h-12 bg-white/10 rounded animate-pulse" />
            <div className="h-8 bg-white/10 rounded w-3/4 mx-auto animate-pulse" />
          </div>
          
          <div className="w-full max-w-2xl">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="h-24 bg-white/10 rounded animate-pulse mb-4" />
              <div className="flex justify-end">
                <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="mt-12 w-full max-w-3xl">
            <div className="h-4 bg-white/10 rounded w-48 mx-auto animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
