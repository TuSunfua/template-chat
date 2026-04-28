import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { authOptions } from "@/auth";

const f = createUploadthing();

export const uploadRouter = {
  chatAttachment: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 4,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 2,
    },
    text: {
      maxFileSize: "4MB",
      maxFileCount: 2,
    },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
