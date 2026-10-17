# Local receipt OCR

Receipt scanning uses PaddleOCR 3.7 with ONNX Runtime and locally cached pretrained models: PP-OCRv6 medium for English and the PP-OCRv5 mobile Devanagari recognizer for Hindi/Devanagari. OCR runs on the backend host; receipt images are not sent to a cloud OCR service. Both pipelines initialize once per backend process. PaddleOCR downloads detector and recognition weights on the first scan; allow outbound access for model setup, or pre-populate PaddleX's model cache before starting the demo. On macOS with Python 3.10, the optional extra pins SciPy below 1.15 to avoid a binary-loader incompatibility.

Install the optional OCR dependencies from `backend/` (Python 3.10+):

```bash
uv sync --extra ocr
```

Start the API (`DEBUG=true uv run --locked --extra ocr uvicorn app.main:app --reload`) and the frontend (`cd ../frontend && npm run dev`). Authenticated clients can send one PNG, JPEG, or WEBP image, up to 10 MB and 20 megapixels, as multipart field `file` to `POST /api/v1/receipt-ocr/scan`. Example (replace the placeholder with a valid access token):

```bash
curl -X POST http://localhost:8000/api/v1/receipt-ocr/scan \
  -H 'Authorization: Bearer REPLACE_WITH_ACCESS_TOKEN' \
  -F 'file=@/path/to/receipt.jpg;type=image/jpeg'
```

For a staging backend, create `backend/.env.staging.local` locally with staging-only values for `APP_ENV=staging`, `DEBUG=false`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, and `JWT_SECRET_KEY`. Use the staging database URL, project URL, Storage secret key, and a separate application JWT secret. Do not put the Storage secret key in frontend configuration or a `NEXT_PUBLIC_*` variable. The root `.gitignore` excludes this staging file.

Run the following from `backend/` to load that file explicitly:

```bash
unset APP_NAME APP_VERSION APP_ENV DEBUG DATABASE_URL SUPABASE_URL SUPABASE_KEY JWT_SECRET_KEY JWT_ALGORITHM ACCESS_TOKEN_EXPIRE_MINUTES CORS_ORIGINS UV_ENV_FILE UV_NO_ENV_FILE
uv run --locked --extra ocr --env-file .env.staging.local uvicorn app.main:app --reload
```

`uv run --env-file` supplies values to the process, but inherited shell environment variables take precedence over values in an environment file. The `unset` command clears the backend settings and uv dotenv selectors for this shell before loading the staging file. Include every required staging setting in that file; do not rely on omitted values falling back to the regular `.env` file.

The endpoint returns recognized text and line confidence values, plus unverified merchant/date/amount candidates. It returns `400` for invalid images, `401` without authentication, and `503` if the local engine or model weights are unavailable. The frontend review screen requires explicit confirmation before creating an expense and then uses the existing private attachment upload flow.

Demo: sign in, ensure a draft expense report exists, open **Scan Receipt**, choose a permitted receipt image, review/correct each suggested value, and select **Confirm & save expense**. The created expense and receipt appear in that report. To exercise graceful OCR failure, use a blank or unreadable image; the page shows the error and still permits manual entry. Supply a real receipt you are permitted to use for recognition-quality evaluation; no receipt sample is bundled here.

The English and Devanagari recognizers are pretrained and have not been fine-tuned for receipts. The adapter runs both locally and aligns their line detections by image position, selecting Devanagari text where that script is detected; this increases CPU work. Devanagari recognition covers Hindi and numerals; Marathi words and code-mixed text still require manual review. The backend currently supports PNG, JPEG, and WEBP for OCR; PDF and HEIC remain supported only by the separate existing attachment workflow. If PaddleOCR/ONNX Runtime or model initialization/download is unavailable, the OCR endpoint returns a setup error and the review screen still allows manual field entry. No database migration is required.
