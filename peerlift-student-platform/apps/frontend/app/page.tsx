export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          PeerLift
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Financial Literacy & Peer Mentorship Platform
        </p>
        <p className="mt-4 text-base text-muted-foreground">
          Empowering students through financial education, mentorship, and AI-powered insights.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 font-semibold transition-colors hover:bg-accent"
          >
            Create Account
          </a>
        </div>
      </div>
    </main>
  );
}
