import React, { useState } from "react";
import { Check, X, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface LinkInputProps {
  onLinkSubmit: (link: string) => void;
  placeholder?: string;
  label?: string;
}

export const LinkInput: React.FC<LinkInputProps> = ({
  onLinkSubmit,
  placeholder = "Paste your link here",
  label = "Add Link",
}) => {
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!link) return;

    // Basic validation
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      setStatus("error");
      setErrorMessage("Link must start with http:// or https://");
      return;
    }

    setStatus("loading");

    // Simulate validation and processing
    setTimeout(() => {
      try {
        onLinkSubmit(link);
        setStatus("success");

        // Reset after success
        setTimeout(() => {
          setLink("");
          setStatus("idle");
        }, 1500);
      } catch (error) {
        console.error("Error processing link:", error);
        setStatus("error");
        setErrorMessage("Failed to process link");
      }
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2">
        {label && <label className="text-sm font-medium">{label}</label>}

        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              value={link}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLink(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={placeholder}
              className={`pl-10 pr-10 ${
                status === "error"
                  ? "border-destructive focus-visible:ring-destructive"
                  : status === "success"
                  ? "border-green-500 focus-visible:ring-green-500"
                  : ""
              }`}
              disabled={status === "loading" || status === "success"}
            />
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            {status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {status === "loading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {status === "success" && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {status === "error" && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </motion.div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!link || status === "loading" || status === "success"}
          >
            Add
          </Button>
        </div>

        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive mt-1"
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    </form>
  );
};
