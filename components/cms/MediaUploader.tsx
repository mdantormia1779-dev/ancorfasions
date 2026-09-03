"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { uploadMedia } from "@/actions/cms.actions";
import { toast } from "sonner";

export function MediaUploader() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadMedia(formData);
      toast.success("Media uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*,video/*,application/pdf"
      />
      <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
        <Upload className="mr-2 h-4 w-4" /> 
        {loading ? "Uploading..." : "Upload Media"}
      </Button>
    </>
  );
}
