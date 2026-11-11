# Doctor avatars on Cloudflare R2

Set the server environment variables listed in `.env.example`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_URL` (the bucket's public HTTPS origin/custom domain). Use an R2 API token with Object Read & Write access scoped to this bucket. Restart the API after configuration.

Configure a public domain for the bucket so saved avatar URLs can be displayed on the website.

The admin sends a multipart image to its same-origin `/api/v1/admin/doctors/avatar-upload` endpoint. The authenticated API validates the file and uploads it to R2 using server credentials. Browser-to-R2 upload CORS is no longer required. Ensure the reverse proxy permits upload request bodies of at least 6 MB, including multipart overhead.

Create or edit a doctor, select an avatar, wait for the preview, then save the doctor. Upload failure keeps the existing avatar. JPG, PNG and WebP are accepted up to 5 MB; the server also checks file signatures. Removing an avatar clears the doctor's reference when saved; it does not delete the object from R2. Cancelled/replaced uploads may leave unreferenced objects in the bucket.

If upgrading from the direct presigned upload version, restart the API and refresh/rebuild the admin together. Existing bucket CORS rules may remain, but are not used by this upload flow.

Reference: https://developers.cloudflare.com/r2/buckets/cors/
