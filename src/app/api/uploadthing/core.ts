import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const f = createUploadthing()

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers()
      })

      if (!session?.user?.id) throw new Error("Unauthorized")

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("file url", file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter