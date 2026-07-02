"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting: boolean;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
  deleting,
}: DeleteAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/8 bg-zinc-900 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <DialogTitle className="text-zinc-100">Delete account</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400">
            This permanently deletes your Livefolio account and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm font-medium text-red-200">
              You will permanently lose:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-red-300/80">
              <li>• Your portfolio and all published content</li>
              <li>• Imported resume, GitHub, and Medium data</li>
              <li>• Analytics and subscription access</li>
              <li>• Your account and login credentials</li>
            </ul>
          </div>
          <p className="text-xs text-zinc-500">
            If you only want to sign out, use the sign out button in the sidebar.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full border-white/10 hover:bg-white/5"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-full"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete my account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
