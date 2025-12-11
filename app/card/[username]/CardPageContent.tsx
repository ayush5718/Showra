"use client";

import { useEffect, useState, use } from "react";
import { CardWrapper } from "@/components/features/card/variants/CardWrapper";
import { CardVariant } from "@/components/features/card/variants/CardSelector";
import { useSearchParams } from "next/navigation";

interface CardPageContentProps {
  params: Promise<{ username: string }>;
}

export function CardPageContent({ params }: CardPageContentProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const username = resolvedParams.username;
  const variant = (searchParams.get("variant") || "card1") as CardVariant;

  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch card data from API
        const response = await fetch(`/api/card-data/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(`Card not found for @${username}. Please create your devcard in the dashboard first.`);
          } else {
            throw new Error("Failed to fetch card data");
          }
          return;
        }
        
        const data = await response.json();
        
        // Validate that we have the required data
        if (!data.profile || !data.stats) {
          throw new Error("Invalid card data received");
        }
        
        setCardData(data);
      } catch (err) {
        console.error("Error fetching card data:", err);
        if (!error) {
          setError(err instanceof Error ? err.message : "Failed to load card. Please make sure the card has been created.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCardData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-[#00E5FF]"></div>
          <p className="mt-4 text-gray-400">Loading card for @{username}...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Card Not Found</h1>
          <p className="text-gray-400 mb-4">
            {error || `Could not find a card for @${username}`}
          </p>
          <p className="text-sm text-gray-500">
            Please create your devcard in the dashboard first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            @{username}'s DevCard
          </h1>
          <p className="text-gray-400">Developer Profile Card</p>
        </div>

        {/* Card Display */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <CardWrapper
              variant={variant}
              profile={{
                login: cardData.profile.login,
                name: cardData.profile.name || null,
                avatarUrl: cardData.profile.avatarUrl || "",
                bio: cardData.profile.bio || null,
                location: cardData.profile.location || null,
                createdAt: cardData.profile.createdAt || new Date().toISOString(),
              }}
              stats={cardData.stats}
              topRepo={cardData.topRepo}
              topLanguages={cardData.languages || []}
              technologies={cardData.technologies}
              heatmap={cardData.heatmap || []}
              repositories={cardData.repositories || []}
              skipAI={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Created with{" "}
            <a
              href="/"
              className="text-[#00E5FF] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Showra AI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

