import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProcessResponse, type CapacityResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === ENCODE ===
export function useEncode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.stego.encode.path, {
        method: api.stego.encode.method,
        body: formData,
        // Don't set Content-Type header manually for FormData, browser does it
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Encoding failed");
      }

      return api.stego.encode.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Encryption Successful",
        description: data.message || "Message embedded in image successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
    },
    onError: (error: Error) => {
      toast({
        title: "Encryption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === DECODE ===
export function useDecode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.stego.decode.path, {
        method: api.stego.decode.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Decoding failed");
      }

      return api.stego.decode.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Decryption Complete",
        description: "Message extracted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
    },
    onError: (error: Error) => {
      toast({
        title: "Decryption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === CAPACITY ===
export function useCapacity() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(api.stego.capacity.path, {
        method: api.stego.capacity.method,
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Capacity check failed");
      }

      return api.stego.capacity.responses[200].parse(await res.json());
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
