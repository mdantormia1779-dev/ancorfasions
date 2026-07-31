import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  );
}
