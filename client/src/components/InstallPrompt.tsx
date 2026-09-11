import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Shows an "Install app" button when the browser fires the
 * `beforeinstallprompt` event (Chrome/Edge/Android). Hidden once the
 * app is already running standalone or the user dismisses it.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferred) return null;

  const handleInstall = async () => {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      setDeferred(null);
    }
  };

  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-3 pr-2 shadow-elegant">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
        <Download className="h-4 w-4" />
      </div>
      <div className="pr-1">
        <p className="text-sm font-semibold leading-tight text-foreground">
          Install FinanceFlow
        </p>
        <p className="text-[11px] text-muted-foreground">
          Offline access · works like an app
        </p>
      </div>
      <Button size="sm" onClick={handleInstall} className="h-8">
        Install
      </Button>
      <button
        onClick={() => setVisible(false)}
        className="rounded-md p-1 text-muted-foreground hover:bg-muted"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
