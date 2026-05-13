'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PeerLift</h1>
            <p className="text-muted-foreground">Financial Literacy & Peer Mentorship</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.firstName}!</h2>
          <p className="text-muted-foreground">You are logged in as {user.role}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Financial Dashboard</CardTitle>
              <CardDescription>Track your spending and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Transactions</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings Goals</CardTitle>
              <CardDescription>Manage your financial targets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Set Goals</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Get personalized financial advice</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Insights</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Modules</CardTitle>
              <CardDescription>Improve your financial literacy</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Browse Modules</Button>
            </CardContent>
          </Card>

          {(user.role === 'STUDENT') && (
            <Card>
              <CardHeader>
                <CardTitle>Mentorship</CardTitle>
                <CardDescription>Connect with mentors</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Find Mentors</Button>
              </CardContent>
            </Card>
          )}

          {(user.role === 'MENTOR') && (
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Manage mentorship sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Sessions</Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 p-8 rounded-lg bg-muted border">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="text-lg font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-lg font-semibold">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="text-lg font-semibold">{user.organizationId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
