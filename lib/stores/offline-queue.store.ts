import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UpdateProfileDTO } from "@/types/domain/auth.types";

type QueuedMutation = {
  id: string;
  type: "UPDATE_PROFILE";
  // Images are excluded — local file URIs don't survive persistence
  payload: Omit<UpdateProfileDTO, "profileImage">;
  createdAt: number;
};

type OfflineQueueStore = {
  queue: QueuedMutation[];
  enqueue: (payload: Omit<UpdateProfileDTO, "profileImage">) => void;
  dequeue: (id: string) => void;
  flush: () => Promise<void>;
};

export const useOfflineQueue = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],

      enqueue: (payload) => {
        set((prev) => ({
          queue: [
            ...prev.queue,
            {
              id: Date.now().toString(),
              type: "UPDATE_PROFILE",
              payload,
              createdAt: Date.now(),
            },
          ],
        }));
      },

      dequeue: (id) => {
        set((prev) => ({ queue: prev.queue.filter((m) => m.id !== id) }));
      },

      flush: async () => {
        const { queue, dequeue } = get();
        if (queue.length === 0) return;

        const { UserService } = await import("@/services/user.service");
        const { queryClient } = await import("@/lib/query/query-client");

        for (const mutation of queue) {
          try {
            const { payload } = mutation;
            const formData = new FormData();

            if (payload.firstName) formData.append("firstName", payload.firstName);
            if (payload.lastName) formData.append("lastName", payload.lastName);
            if (payload.email) formData.append("email", payload.email);

            await UserService.updateProfile({ data: formData });
            await queryClient.invalidateQueries({ queryKey: ["profile"] });
          } catch {
            // Dequeue regardless — stale mutations should not block future ones
          } finally {
            dequeue(mutation.id);
          }
        }
      },
    }),
    {
      name: "offline-queue",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
