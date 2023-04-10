import { execSync } from 'child_process'
import path from 'path'

async function main() {
    const bucket = 'generated-ai-uploads'
    execSync(
        `gcloud storage buckets describe gs://${bucket} --format="default(cors)"`,
        { stdio: 'inherit' },
    )
    execSync(
        `gsutil cors set ${path.resolve(
            __dirname,
            'cors.json',
        )} gs://${bucket}`,
        { stdio: 'inherit' },
    )
}

main()
