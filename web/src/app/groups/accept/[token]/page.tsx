"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, LogIn } from "lucide-react";
import { acceptGroupInvite, getToken } from "../../../../lib/api";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "needs-auth"
  >("loading");
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (token) {
      handleInvite();
    }
  }, [token]);

  async function handleInvite() {
    try {
      const authToken = getToken();

      if (!authToken) {
        // User not logged in, redirect to login with invite token
        setStatus("needs-auth");
        return;
      }

      const result = await acceptGroupInvite(token);
      setStatus("success");
      setMessage(result.message || "Successfully joined group!");
      setGroupName(result.group?.name || "");

      // Redirect to groups page after 3 seconds
      setTimeout(() => {
        router.push("/groups");
      }, 3000);
    } catch (err: any) {
      // If invite was already used (processed during login/register), treat as success
      if (
        err.message?.includes("already been used") ||
        err.message?.includes("already a member")
      ) {
        setStatus("success");
        setMessage("You have already joined this group!");
        setTimeout(() => {
          router.push("/groups");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(err.message || "Failed to accept invite");
      }
    }
  }

  if (status === "needs-auth") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <LogIn size={64} className="mx-auto mb-4 text-pink-400" />
          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">
            You need to login or create an account to accept this group invite.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/login?inviteToken=${token}`}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
            >
              Login
            </a>
            <a
              href={`/register?inviteToken=${token}`}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2
              className="animate-spin text-pink-500 mx-auto mb-4"
              size={64}
            />
            <h1 className="text-2xl font-bold text-white mb-4">
              Accepting Invite...
            </h1>
            <p className="text-gray-300">
              Please wait while we add you to the group.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h1 className="text-2xl font-bold text-white mb-4">Success!</h1>
            <p className="text-gray-300 mb-2">{message}</p>
            {groupName && (
              <p className="text-pink-400 font-semibold mb-6">
                Group: {groupName}
              </p>
            )}
            <p className="text-sm text-gray-400">
              Redirecting to groups page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="text-red-500 mx-auto mb-4" size={64} />
            <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
            <p className="text-gray-300 mb-6">{message}</p>
            <a
              href="/groups"
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Groups
            </a>
          </>
        )}
      </div>
    </div>
  );
}
