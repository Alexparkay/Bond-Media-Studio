"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useRef } from "react";
import { Button } from "./ui/button";
import { RefreshCwIcon } from "lucide-react";
import { ShareButton } from "./share-button";

export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
}) {
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId, baseId: props.baseId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);

  return (
    <div className="flex flex-col overflow-hidden h-screen border-l border-gray-800 transition-opacity duration-700 mt-[2px] bg-black">
      <div className="h-12 border-b border-gray-800 items-center flex px-2 bg-black sticky top-0 justify-end gap-2">
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => devServerRef.current?.refresh()}
          className="hover:bg-white/10 text-white"
        >
          <RefreshCwIcon />
        </Button>
        <ShareButton domain={props.domain} appId={props.appId} />
      </div>
      <FreestyleDevServer
        ref={devServerRef}
        actions={{ requestDevServer }}
        repoId={props.repo}
        loadingComponent={({ iframeLoading, devCommandRunning }) =>
          !devCommandRunning && (
            <div className="flex items-center justify-center h-full bg-black">
              <div>
                <div className="text-center text-white mb-4">
                  {iframeLoading ? "Loading Preview" : "Starting Development Server"}
                </div>
                <div>
                  <div className="loader"></div>
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
