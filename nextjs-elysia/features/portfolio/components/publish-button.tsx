"use client";

import {
  usePortfolio,
  usePublishPortfolio,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import { toast } from "sonner";
import {
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Share2,
} from "lucide-react";

export function PublishButton() {
  const { data: portfolio, isLoading } = usePortfolio();
  const publishPortfolio = usePublishPortfolio();

  async function handleToggle(checked: boolean) {
    try {
      await publishPortfolio.mutateAsync(checked);
      toast.success(checked ? "Portfolio published" : "Portfolio unpublished");
    } catch {
      toast.error("Failed to update publish status");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPublished = portfolio?.isPublished ?? false;
  const slug = portfolio?.slug ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Publish Portfolio
        </CardTitle>
        <CardDescription>
          Control whether your portfolio is publicly accessible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Alert */}
        {isPublished ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Published</AlertTitle>
            <AlertDescription>
              Your portfolio is live and accessible to anyone with the link.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Published</AlertTitle>
            <AlertDescription>
              Your portfolio is currently hidden. Toggle the switch to make it
              public.
            </AlertDescription>
          </Alert>
        )}

        {/* Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="publish-toggle"
              className="text-base font-medium cursor-pointer"
            >
              {isPublished ? "Portfolio is live" : "Portfolio is hidden"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPublished
                ? "Visitors can view your portfolio at the public URL."
                : "Only you can see your portfolio right now."}
            </p>
          </div>
          <Switch
            id="publish-toggle"
            checked={isPublished}
            onCheckedChange={handleToggle}
            disabled={publishPortfolio.isPending}
          />
        </div>

        {/* Share */}
        {slug && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Share your portfolio</p>
              <p className="text-xs text-muted-foreground font-mono">
                /p/{slug}
              </p>
            </div>
            <ShareDialog slug={slug} isPublished={isPublished}>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </ShareDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
