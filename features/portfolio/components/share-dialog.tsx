"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, Check, ExternalLink, Share2 } from "lucide-react";

interface ShareDialogProps {
  slug: string;
  isPublished: boolean;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function ShareDialog({ slug, isPublished, trigger, children }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${slug}`
      : `/p/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? trigger ?? (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Portfolio</DialogTitle>
          <DialogDescription>
            {isPublished
              ? "Your portfolio is live. Share the link below with anyone."
              : "Your portfolio is not published yet. Publish it first to make it accessible to others."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Public URL</Label>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly className="flex-1 font-mono text-sm" />
              <Button
                variant="outline"
                size="default"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {isPublished && (
            <Button variant="default" className="w-full" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Portfolio
              </a>
            </Button>
          )}

          {!isPublished && (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md px-3 py-2">
              Publish your portfolio to make this link accessible to visitors.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
