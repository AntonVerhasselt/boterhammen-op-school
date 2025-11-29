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

// Helper to check if user has dismissed the popup before
const PWA_DISMISSED_KEY = "pwa-install-dismissed";
const PWA_DISMISSED_EXPIRY_DAYS = 7; // Show again after 7 days

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const dismissed = localStorage.getItem(PWA_DISMISSED_KEY);
  if (!dismissed) return false;
  
  const dismissedTime = parseInt(dismissed, 10);
  const now = Date.now();
  const expiryTime = dismissedTime + PWA_DISMISSED_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  
  return now < expiryTime;
}

function markAsDismissed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
}

export function PWAInstallPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const logs: string[] = [];

    // Check if user dismissed recently
    if (wasDismissedRecently()) {
      logs.push("User dismissed popup recently, not showing");
      setDebugInfo(logs);
      return;
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true);

    if (isStandalone) {
      logs.push("App already running in standalone mode");
      setDebugInfo(logs);
      return;
    }

    // Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    logs.push(`User Agent: ${userAgent}`);
    logs.push(`Android: ${isAndroidDevice}, iOS: ${isIosDevice}`);

    // Only show on mobile/tablet (Android or iOS)
    if (!isAndroidDevice && !isIosDevice) {
      logs.push("Not a mobile device, not showing popup");
      setDebugInfo(logs);
      return;
    }

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    if (isAndroidDevice) {
      logs.push("Android device detected, waiting for beforeinstallprompt event");
      
      // Set a timeout to show manual instructions if event doesn't fire
      const fallbackTimer = setTimeout(() => {
        logs.push("beforeinstallprompt event did not fire within 3 seconds");
        logs.push("Showing manual installation instructions");
        setDebugInfo([...logs]);
        setShowAndroidInstructions(true);
        setIsOpen(true);
      }, 3000);

      const handleBeforeInstallPrompt = (e: Event) => {
        clearTimeout(fallbackTimer);
        e.preventDefault();
        logs.push("beforeinstallprompt event fired!");
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setDebugInfo([...logs]);
        setIsOpen(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      setDebugInfo(logs);

      return () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    } else if (isIosDevice) {
      // For iOS, show immediately since there's no event
      logs.push("iOS device detected, showing popup immediately");
      setDebugInfo(logs);
      setIsOpen(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (isAndroid) {
      if (deferredPrompt) {
        // Use the native install prompt
        try {
          await deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsOpen(false);
          }
        } catch (error) {
          console.error("Error showing install prompt:", error);
          // Fall back to showing manual instructions
          setShowAndroidInstructions(true);
        }
      } else {
        // No native prompt available, show manual instructions
        setShowAndroidInstructions(true);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    markAsDismissed();
  };

  if (!isMounted) return null;

  // Debug mode: show debug info by adding ?pwa-debug=true to URL
  const showDebug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("pwa-debug");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md mx-auto w-[90%] rounded-xl">
        {showDebug && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-900 text-xs rounded">
            <strong>Debug Info:</strong>
            <ul className="list-disc list-inside">
              {debugInfo.map((info, i) => (
                <li key={i}>{info}</li>
              ))}
            </ul>
          </div>
        )}
        {!showIOSInstructions && !showAndroidInstructions ? (
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
                Install
              </Button>
            </DialogFooter>
          </>
        ) : showIOSInstructions ? (
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
        ) : (
          <>
            <DialogHeader className="flex flex-col items-center gap-2 pt-2">
              <DialogTitle>Install on Android</DialogTitle>
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
                  Tap the <strong>three dots menu</strong> (⋮) in the top right corner of your browser.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                  2
                </div>
                <p className="pt-1">
                  Look for and tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                  3
                </div>
                <p className="pt-1">
                  Tap <strong>Add</strong> or <strong>Install</strong> to confirm.
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

