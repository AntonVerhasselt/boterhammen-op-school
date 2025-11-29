"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface PWADebugInfo {
  userAgent: string;
  isAndroid: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  hasServiceWorker: boolean;
  serviceWorkerState: string;
  manifestUrl: string | null;
  manifestFetchable: boolean;
  manifestData: unknown;
  beforeInstallPromptFired: boolean;
  canInstall: boolean;
  isHttps: boolean;
  displayMode: string;
}

export default function PWADebugPage() {
  const [debugInfo, setDebugInfo] = useState<PWADebugInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const checkPWAStatus = useCallback(async () => {
    setLoading(true);
    setLogs([]);
    addLog("Starting PWA diagnostics...");

    const info: PWADebugInfo = {
      userAgent: navigator.userAgent,
      isAndroid: /android/i.test(navigator.userAgent),
      isIOS: /iphone|ipad|ipod/i.test(navigator.userAgent),
      isStandalone: window.matchMedia("(display-mode: standalone)").matches,
      hasServiceWorker: "serviceWorker" in navigator,
      serviceWorkerState: "unknown",
      manifestUrl: null,
      manifestFetchable: false,
      manifestData: null,
      beforeInstallPromptFired: false,
      canInstall: false,
      isHttps: window.location.protocol === "https:",
      displayMode: window.matchMedia("(display-mode: standalone)").matches
        ? "standalone"
        : window.matchMedia("(display-mode: fullscreen)").matches
        ? "fullscreen"
        : window.matchMedia("(display-mode: minimal-ui)").matches
        ? "minimal-ui"
        : "browser",
    };

    addLog(`Device: ${info.isAndroid ? "Android" : info.isIOS ? "iOS" : "Other"}`);
    addLog(`Protocol: ${window.location.protocol}`);
    addLog(`Display mode: ${info.displayMode}`);

    // Check for manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      info.manifestUrl = manifestLink.getAttribute("href");
      addLog(`Manifest link found: ${info.manifestUrl}`);

      try {
        const response = await fetch(info.manifestUrl!);
        if (response.ok) {
          info.manifestData = await response.json();
          info.manifestFetchable = true;
          addLog("✓ Manifest fetched successfully");
        } else {
          addLog(`✗ Manifest fetch failed: ${response.status}`);
        }
      } catch (error) {
        addLog(`✗ Error fetching manifest: ${error}`);
      }
    } else {
      addLog("✗ No manifest link found in document");
    }

    // Check service worker
    if (info.hasServiceWorker) {
      addLog("✓ Service Worker API available");
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.active) {
          info.serviceWorkerState = "active";
          addLog(`✓ Service Worker: active`);
        } else if (registration) {
          info.serviceWorkerState = registration.installing ? "installing" : registration.waiting ? "waiting" : "unknown";
          addLog(`Service Worker: ${info.serviceWorkerState}`);
        } else {
          info.serviceWorkerState = "not registered";
          addLog("✗ Service Worker not registered");
        }
      } catch (error) {
        addLog(`✗ Error checking Service Worker: ${error}`);
      }
    } else {
      addLog("✗ Service Worker API not available");
    }

    // Check if beforeinstallprompt was fired
    info.beforeInstallPromptFired = !!deferredPrompt;
    if (deferredPrompt) {
      addLog("✓ beforeinstallprompt event was fired");
      info.canInstall = true;
    } else {
      addLog("⚠ beforeinstallprompt event has not fired yet");
    }

    setDebugInfo(info);
    setLoading(false);
    addLog("Diagnostics complete!");
  }, [addLog, deferredPrompt]);

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      addLog("🎉 beforeinstallprompt event fired!");
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    // Run initial check after a short delay
    const timeoutId = setTimeout(() => {
      checkPWAStatus();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [checkPWAStatus, addLog]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      addLog("✗ No install prompt available");
      return;
    }

    try {
      addLog("Showing install prompt...");
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      addLog(`User choice: ${outcome}`);

      if (outcome === "accepted") {
        addLog("✓ User accepted the install");
        setDeferredPrompt(null);
      } else {
        addLog("User dismissed the install");
      }
    } catch (error) {
      addLog(`✗ Error showing install prompt: ${error}`);
    }
  };

  const StatusIcon = ({ value }: { value: boolean }) =>
    value ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            PWA Installation Debugger
            <Button size="sm" variant="outline" onClick={checkPWAStatus}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Diagnose PWA installation issues on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading diagnostics...</div>
          ) : debugInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Device Info</h3>
                  <div className="flex items-center gap-2">
                    <StatusIcon value={debugInfo.isAndroid || debugInfo.isIOS} />
                    <span>
                      Mobile Device:{" "}
                      {debugInfo.isAndroid
                        ? "Android"
                        : debugInfo.isIOS
                        ? "iOS"
                        : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon value={debugInfo.isHttps} />
                    <span>HTTPS: {debugInfo.isHttps ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon value={debugInfo.isStandalone} />
                    <span>
                      Standalone Mode: {debugInfo.isStandalone ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Display: {debugInfo.displayMode}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">PWA Requirements</h3>
                  <div className="flex items-center gap-2">
                    <StatusIcon value={debugInfo.manifestFetchable} />
                    <span>
                      Manifest:{" "}
                      {debugInfo.manifestFetchable ? "Valid" : "Invalid"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      value={
                        debugInfo.hasServiceWorker &&
                        debugInfo.serviceWorkerState === "active"
                      }
                    />
                    <span>
                      Service Worker: {debugInfo.serviceWorkerState}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {debugInfo.beforeInstallPromptFired ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span>
                      Install Prompt:{" "}
                      {debugInfo.beforeInstallPromptFired ? "Ready" : "Waiting"}
                    </span>
                  </div>
                </div>
              </div>

              {debugInfo.canInstall && (
                <div className="pt-4">
                  <Button onClick={handleInstall} className="w-full">
                    Install App Now
                  </Button>
                </div>
              )}

              {!debugInfo.canInstall && debugInfo.isAndroid && (
                <div className="pt-4">
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">
                            Install prompt not available yet
                          </p>
                          <p className="text-sm text-muted-foreground">
                            On Android, Chrome will show the install prompt after
                            you meet the engagement criteria. This typically requires:
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Visiting the site at least twice</li>
                            <li>At least 5 minutes between visits</li>
                            <li>Valid PWA requirements (all checks above pass)</li>
                          </ul>
                          <p className="text-sm text-muted-foreground">
                            You can manually install by tapping the menu (⋮) and
                            selecting &quot;Add to Home screen&quot; or &quot;Install app&quot;.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {debugInfo.manifestData ? (
                <div className="pt-4">
                  <details className="space-y-2">
                    <summary className="font-semibold cursor-pointer">
                      Manifest Details
                    </summary>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(debugInfo.manifestData, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-xs font-mono text-muted-foreground">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Testing on Your Phone:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Deploy your app to production or use a local tunnel service like
                ngrok
              </li>
              <li>Open this page on your phone: /pwa-debug</li>
              <li>Check all the diagnostics above</li>
              <li>
                If all checks pass but install prompt doesn&apos;t show, interact with
                the site for a few minutes
              </li>
              <li>
                Try manually installing: Menu (⋮) → &quot;Add to Home screen&quot;
              </li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Testing with ngrok (Local):</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Install ngrok: npm install -g ngrok</li>
              <li>Start your dev server: npm run dev</li>
              <li>In another terminal: ngrok http 3000</li>
              <li>Open the https URL on your phone</li>
              <li>Navigate to /pwa-debug to check status</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

