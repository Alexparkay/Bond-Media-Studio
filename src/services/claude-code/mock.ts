import { ClaudeCodeMessage, ClaudeCodeOptions, WebsiteGenerationRequest } from "./types";

export class MockClaudeCodeService {
  async *query(
    request: WebsiteGenerationRequest,
    options?: ClaudeCodeOptions
  ): AsyncGenerator<ClaudeCodeMessage> {
    // Simulate planning phase
    yield {
      type: "plan",
      content: "Planning your premium website...",
      metadata: {
        plan: [
          "Create responsive header with navigation",
          "Design hero section with compelling CTA",
          "Build features showcase",
          "Add testimonials section",
          "Implement contact form",
          "Optimize for SEO and performance"
        ]
      }
    };

    // Simulate file creation
    yield {
      type: "create",
      content: "Creating homepage structure...",
      metadata: {
        file: "src/app/page.tsx",
        diff: `+import { Hero } from '@/components/Hero'
+import { Features } from '@/components/Features'
+import { Testimonials } from '@/components/Testimonials'

+export default function HomePage() {
+  return (
+    <main className="min-h-screen">
+      <Hero />
+      <Features />
+      <Testimonials />
+    </main>
+  )
+}`
      }
    };

    // Simulate component creation
    yield {
      type: "create",
      content: "Building Hero component with modern design...",
      metadata: {
        file: "src/components/Hero.tsx",
        diff: `+export function Hero() {
+  return (
+    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
+      <div className="container mx-auto px-6 text-center">
+        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
+          Transform Your Business
+        </h1>
+        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
+          Professional solutions that drive growth and deliver results
+        </p>
+        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
+          Get Started Today
+        </button>
+      </div>
+    </section>
+  )
+}`
      }
    };

    // Simulate explanation
    yield {
      type: "explanation",
      content: "I've created a modern, professional website with a focus on conversion optimization. The design features a gradient hero section, clear CTAs, and responsive layouts optimized for all devices."
    };

    // Simulate completion
    yield {
      type: "complete",
      content: "Website generation complete! Your premium website is ready with all requested features."
    };
  }

  async generateWebsite(
    request: WebsiteGenerationRequest,
    options?: ClaudeCodeOptions
  ): Promise<AsyncGenerator<ClaudeCodeMessage>> {
    return this.query(request, options);
  }
} 