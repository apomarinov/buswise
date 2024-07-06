import { env } from "app/env";
import { type ApiResponse } from "app/types/client";

export const api = async <T>(
  url: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_PUBLIC_URL}/api${url}`,
      init,
    );
    return response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};
