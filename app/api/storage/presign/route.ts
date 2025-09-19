import { NextResponse, type NextRequest } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

const endpoint = process.env.STORAGE_S3_ENDPOINT
const region = process.env.STORAGE_S3_REGION || 'us-east-1'
const bucket = process.env.STORAGE_S3_BUCKET
const accessKeyId = process.env.STORAGE_S3_ACCESS_KEY_ID
const secretAccessKey = process.env.STORAGE_S3_SECRET_ACCESS_KEY
const forcePathStyle = (process.env.STORAGE_S3_FORCE_PATH_STYLE || 'true').toLowerCase() !== 'false'

function getS3() {
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('Storage S3 env vars not configured')
  }
  return new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { contentType, folder = 'uploads', ext } = await req.json()

    // Basic plan check (size/limit checks should be performed by /api/subscription/check-limit prior to this call)
    const key = `${folder}/${user.id}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext ? `.${ext.replace(/^\./,'')}` : ''}`

    const s3 = getS3()
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutes

    // Public URL (if bucket is public). For Supabase S3-compat, path-style works.
    const publicUrlBase = process.env.STORAGE_PUBLIC_BASE_URL
    const publicUrl = publicUrlBase ? `${publicUrlBase}/${key}` : null

    return NextResponse.json({ url, key, publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to presign upload' }, { status: 500 })
  }
}
