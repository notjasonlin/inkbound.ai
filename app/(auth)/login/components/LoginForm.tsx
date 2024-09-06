import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SignInWithGoogleButton from "./SignInWithGoogleButton"

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Use your Google account to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <SignInWithGoogleButton />
        </div>
      </CardContent>
    </Card>
  )
}
