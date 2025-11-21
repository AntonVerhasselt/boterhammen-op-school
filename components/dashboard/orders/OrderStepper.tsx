import { cn } from "@/lib/utils"

interface OrderStepperProps {
  currentStep: number
}

export function OrderStepper({ currentStep }: OrderStepperProps) {
  return (
    <div className="flex items-center gap-3 mb-8 pb-6 border-b">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
            currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {currentStep > 1 ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            "1"
          )}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Child & Preferences
        </span>
      </div>

      <div
        className={cn(
          "h-px flex-1 transition-colors",
          currentStep >= 2 ? "bg-primary" : "bg-border"
        )}
      />

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
            currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {currentStep > 2 ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            "2"
          )}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Order Details
        </span>
      </div>

      <div
        className={cn(
          "h-px flex-1 transition-colors",
          currentStep >= 3 ? "bg-primary" : "bg-border"
        )}
      />

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
            currentStep >= 3
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          3
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            currentStep >= 3 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Order Overview
        </span>
      </div>
    </div>
  )
}

