// Google OAuth2 Helper Functions

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

/**
 * Initialize Google Sign-In and render button
 */
export const initializeGoogleSignIn = (callback: (response: any) => void) => {
  if (typeof window === "undefined") return;

  // Load Google Sign-In script
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: callback,
      });

      // Render the button
      const buttonDiv = document.getElementById("google-signin-button");
      if (buttonDiv) {
        window.google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: "filled_black",
            size: "large",
            width: buttonDiv.offsetWidth || 350,
            text: "continue_with",
            shape: "rectangular",
          }
        );
      }
    }
  };

  // Only append if not already added
  if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
    document.body.appendChild(script);
  }
};

/**
 * Trigger Google One Tap
 */
export const showGoogleOneTap = () => {
  if (typeof window !== "undefined" && window.google) {
    window.google.accounts.id.prompt();
  }
};

// TypeScript declarations for Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}
