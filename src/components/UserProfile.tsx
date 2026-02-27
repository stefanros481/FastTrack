"use client";

import { useState } from "react";

interface UserProfileProps {
  name: string | null;
  email: string;
  image: string | null;
}

export default function UserProfile({ name, email, image }: UserProfileProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = name || "User";
  const fallbackLetter = (name?.[0] || email[0]).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {image && !imgError ? (
        <img
          src={image}
          alt={displayName}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-[--color-primary] flex items-center justify-center text-white text-xl font-semibold">
          {fallbackLetter}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-base font-medium text-[--color-text] truncate">
          {displayName}
        </p>
        <p className="text-sm text-[--color-text-muted] truncate">{email}</p>
      </div>
    </div>
  );
}
