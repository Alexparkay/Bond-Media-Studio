import { unstable_ViewTransition as ViewTransition } from "react";
import "@/components/loader.css";

export default function Loading() {
  return (
    <ViewTransition>
      <div className="flex justify-center items-center h-screen bg-black">
        <div>
          <div className="text-center text-white mb-4">Loading Bond Media Studio</div>
          <div className="loader"></div>
        </div>
      </div>
    </ViewTransition>
  );
}
