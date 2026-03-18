import { HttpAgent } from "@icp-sdk/core/agent";
import { useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function usePhotoUpload() {
  const { identity } = useInternetIdentity();
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      return hash;
    } finally {
      setIsUploading(false);
    }
  };

  const getPhotoUrl = async (hash: string): Promise<string> => {
    if (!hash) return "";
    const config = await loadConfig();
    const agent = new HttpAgent({
      host: config.backend_host,
      identity: identity ?? undefined,
    });
    const storageClient = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    return storageClient.getDirectURL(hash);
  };

  return { uploadPhoto, getPhotoUrl, isUploading };
}
