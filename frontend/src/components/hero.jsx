import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "./ui/badge";

const Hero = () => {
  const handleGitHubClick = () => {
    window.open(
      "https://github.com/alishanawer/personal-finance-dashboard",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
        />
      </div>
      <div className="relative z-10 container">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-xl bg-background/30 p-4 shadow-sm backdrop-blur-sm">
              <img src="/src/assets/favicon.svg" alt="logo" className="h-16" />
            </div>
            <div>
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl">
                Take Control of Your Money,{" "}
                <span className="text-primary">Effortlessly</span>
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
                Track expenses, analyze spending, and make smarter financial
                decisions — all in one clean, powerful dashboard.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/login">
                <Button className="shadow-sm transition-shadow hover:shadow">
                  Get Started
                </Button>
              </Link>
              <Button
                onClick={handleGitHubClick}
                variant="outline"
                className="group">
                <Github className="h-4 transition-transform group-hover:translate-x-0.5" />{" "}
                Star on GitHub
              </Button>
            </div>
            <div className="mt-15 flex flex-col items-center gap-5">
              <Badge
                variant="outline"
                className="rounded-full px-4 py-2 text-base font-medium bg-background/80 border-muted shadow-sm backdrop-blur-sm">
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                  Built with open-source technologies
                </span>
              </Badge>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://react.dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/react-icon.svg"
                        alt="React logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>React</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="/src/assets/javascript.svg"
                        alt="TypeScript logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>JavaScript</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://tailwindcss.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-icon.svg"
                        alt="Tailwind CSS logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tailwind CSS</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://ui.shadcn.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcn-ui-icon.svg"
                        alt="shadcn/ui logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>ShadCN UI</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.python.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="/src/assets/python.svg"
                        alt="Python logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Python</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://fastapi.tiangolo.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="/src/assets/FastAPI.svg"
                        alt="FastAPI logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>FastAPI</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.postgresql.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "group flex aspect-square h-12 items-center justify-center p-0"
                      )}>
                      <img
                        src="/src/assets/postgresql.svg"
                        alt="PostgreSQL logo"
                        className="h-6 saturate-0 transition-all group-hover:saturate-100"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>PostgreSQL</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
