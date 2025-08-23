import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <SignUp 
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-background border-border shadow-lg",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border-border hover:bg-muted",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              formFieldInput: "bg-background border-border",
              footerActionLink: "text-primary hover:text-primary/80"
            }
          }}
        />
      </div>
    </div>
  )
}