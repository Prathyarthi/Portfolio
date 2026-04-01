import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Stand Out?
        </h2>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-8">
          Join thousands of developers and professionals sharing beautiful
          portfolios with recruiters.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">
            Create Your Portfolio <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
