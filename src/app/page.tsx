"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { useEffect, useState as useReactState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { unstable_ViewTransition as ViewTransition } from "react";
import { UserButton } from "@stackframe/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectsSidebar } from "@/components/projects-sidebar";
import { FolderOpen, Sparkles } from "lucide-react";

const queryClient = new QueryClient();

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useReactState(false);
  const [showProjects, setShowProjects] = useState(false);
  const router = useRouter();

  // For the typing animation
  const placeholderRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderText, setPlaceholderText] = useState("");
  const fullPlaceholder = "Describe your premium landing page";
  const exampleIdeas = [
    "a luxury real estate showcase",
    "a high-end SaaS product launch page",
    "a premium fitness coaching platform",
    "an exclusive membership site",
    "a boutique e-commerce storefront",
  ];

  // Ensure hydration is complete before starting typing animation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (!isMounted) return;

    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let typingTimer: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;

    const typeNextCharacter = () => {
      {
        // Start typing the current example idea
        const currentIdea = exampleIdeas[currentTextIndex];
        if (currentCharIndex < currentIdea.length) {
          setPlaceholderText(
            fullPlaceholder +
              " " +
              currentIdea.substring(0, currentCharIndex + 1)
          );
          currentCharIndex++;
          typingTimer = setTimeout(typeNextCharacter, 100);
        } else {
          // Pause at the end of typing the example
          pauseTimer = setTimeout(() => {
            // Begin erasing the example
            eraseText();
          }, 2000);
        }
      }
    };

    const eraseText = () => {
      const currentIdea = exampleIdeas[currentTextIndex];
      if (currentCharIndex > 0) {
        setPlaceholderText(
          fullPlaceholder + " " + currentIdea.substring(0, currentCharIndex - 1)
        );
        currentCharIndex--;
        typingTimer = setTimeout(eraseText, 50);
      } else {
        // Move to the next example
        currentTextIndex = (currentTextIndex + 1) % exampleIdeas.length;
        pauseTimer = setTimeout(() => {
          typingTimer = setTimeout(typeNextCharacter, 100);
        }, 500);
      }
    };

    // Start the typing animation
    typingTimer = setTimeout(typeNextCharacter, 500);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(pauseTimer);
    };
  }, [isMounted]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&baseId=nextjs-dkjfgdf`
    );
  };

  return (
    <ViewTransition>
      <QueryClientProvider client={queryClient}>
        <ProjectsSidebar isOpen={showProjects} onClose={() => setShowProjects(false)} />
        
        <main className="min-h-screen p-4 relative bg-black overflow-hidden">
          {/* Premium gradient backgrounds */}
          <div className="absolute inset-0 gradient-premium-dark"></div>
          <div className="absolute inset-0 gradient-radial"></div>
          <div className="absolute inset-0 gradient-subtle"></div>
          
          <div className="relative z-10">
            <div className="flex w-full justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">
                  Bond Media Studio
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProjects(true)}
                  className="flex items-center gap-2 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <UserButton />
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="w-full flex flex-col items-center mt-16 sm:mt-24 md:mt-32">
                <h2 className="text-white text-center mb-6 text-4xl sm:text-5xl md:text-6xl font-bold">
                  Create Premium Landing Pages
                </h2>
                <p className="text-gray-400 text-center mb-8 text-lg">
                  Powered by AI, designed for excellence
                </p>

                <div className="w-full relative my-5 max-w-2xl">
                  <div className="relative">
                    {/* Gradient glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-xl opacity-50"></div>
                    
                    <div className="relative w-full overflow-hidden gradient-card rounded-xl border border-white/10 hover:border-white/20 transition-all">
                      <PromptInput>
                        <PromptInputTextarea
                          ref={placeholderRef}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={placeholderText || fullPlaceholder}
                          className="min-h-[100px] bg-transparent border-0 resize-none text-white placeholder:text-gray-500 p-4"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit();
                            }
                          }}
                        />
                        <PromptInputActions className="px-4 pb-4 bg-transparent">
                          <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !prompt.trim()}
                            className="bg-white text-black hover:bg-gray-100 font-semibold px-6 transition-all"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Start Creating
                          </Button>
                        </PromptInputActions>
                      </PromptInput>
                    </div>
                  </div>
                </div>

                <div className="mt-12 w-full max-w-3xl">
                  <p className="text-center text-gray-400 mb-4 text-sm">
                    Choose from our premium templates
                  </p>
                  <Examples setPrompt={setPrompt} />
                </div>

                <div className="mt-16 mb-16">
                  <a
                    href="https://www.bondmedia.co.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group gradient-card border border-white/10 rounded-xl px-6 py-4 mt-4 text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer block hover:border-white/30 hover:shadow-lg hover:shadow-white/5"
                  >
                    <span className="block font-bold text-white">
                      Bond Media Studio
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-300">
                      by Bond Media - Premium Web Solutions
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </QueryClientProvider>
    </ViewTransition>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-2">
        <ExampleButton
          text="Luxury Real Estate"
          promptText="Create a premium real estate landing page with property showcase, virtual tours, and contact forms for high-end properties"
          onClick={(text) => setPrompt(text)}
          className="gradient-card border-white/10 hover:border-white/20 text-white transition-all hover:shadow-md hover:shadow-white/5"
        />
        <ExampleButton
          text="SaaS Product Launch"
          promptText="Build a modern SaaS product launch page with pricing tiers, feature highlights, and demo booking system"
          onClick={(text) => setPrompt(text)}
          className="gradient-card border-white/10 hover:border-white/20 text-white transition-all hover:shadow-md hover:shadow-white/5"
        />
        <ExampleButton
          text="Premium Coaching"
          promptText="Design a high-converting coaching platform landing page with testimonials, booking system, and course showcase"
          onClick={(text) => setPrompt(text)}
          className="gradient-card border-white/10 hover:border-white/20 text-white transition-all hover:shadow-md hover:shadow-white/5"
        />
        <ExampleButton
          text="Exclusive Membership"
          promptText="Create an exclusive membership site landing page with tiered access, member benefits, and secure login portal"
          onClick={(text) => setPrompt(text)}
          className="gradient-card border-white/10 hover:border-white/20 text-white transition-all hover:shadow-md hover:shadow-white/5"
        />
        <ExampleButton
          text="Boutique E-commerce"
          promptText="Build a sophisticated e-commerce landing page with product galleries, checkout flow, and brand storytelling"
          onClick={(text) => setPrompt(text)}
          className="gradient-card border-white/10 hover:border-white/20 text-white transition-all hover:shadow-md hover:shadow-white/5"
        />
        <ExampleButton
          text="Corporate Portfolio"
          promptText="Design a professional corporate portfolio landing page with case studies, services, and client testimonials"
          onClick={(text) => setPrompt(text)}
          className="gradient-card border-white/10 hover:border-white/20 text-white transition-all hover:shadow-md hover:shadow-white/5"
        />
      </div>
    </div>
  );
}
