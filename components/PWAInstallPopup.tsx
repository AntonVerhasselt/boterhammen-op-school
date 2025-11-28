"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SquareArrowUp } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true);

    if (isStandalone) return;

    // Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    // Only show on mobile/tablet (Android or iOS)
    if (!isAndroid && !isIosDevice) return;

    setIsIOS(isIosDevice);

    if (isAndroid) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsOpen(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    } else if (isIosDevice) {
      // For iOS, show immediately since there's no event
      setIsOpen(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsOpen(false);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Optionally save to session storage to not show again in this session?
    // The requirement says "Not now should just close the popup"
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md mx-auto w-[90%] rounded-xl">
        {!showIOSInstructions ? (
          <>
            <DialogHeader className="flex flex-col items-center gap-4 pt-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src="/icons/icon-192.png"
                  alt="Boterhammen op School"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center space-y-1">
                <DialogTitle className="text-xl font-semibold">
                  Boterhammen op School
                </DialogTitle>
                <DialogDescription className="text-center text-base">
                  Install our app for a better experience and easier access to your orders.
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="flex-row gap-3 sm:justify-center w-full mt-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Not now
              </Button>
              <Button 
                onClick={handleInstallClick}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Open
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
             <DialogHeader className="flex flex-col items-center gap-2 pt-2">
              <DialogTitle>Install on iOS</DialogTitle>
              <DialogDescription className="text-center text-base pt-2">
                To install the app on your device:
              </DialogDescription>
            </DialogHeader>
            <div className="px-4 py-2 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                  1
                </div>
                <p className="pt-1">
                  Tap the <strong>Share</strong> button <SquareArrowUp className="inline h-4 w-4 mx-1" /> in the menu bar.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                  2
                </div>
                <p className="pt-1">
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                  3
                </div>
                <p className="pt-1">
                  Tap <strong>Add</strong> in the top right corner.
                </p>
              </div>
            </div>
             <DialogFooter className="mt-2">
              <Button onClick={handleClose} className="w-full">Got it</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

