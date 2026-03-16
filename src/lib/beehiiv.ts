const BEEHIIV_API_URL = 'https://api.beehiiv.com/v2'

interface BeehiivSubscriber {
  email: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referring_site?: string
  custom_fields?: Record<string, string>
}

interface BeehiivResponse {
  data?: {
    id: string
    email: string
    status: string
  }
  errors?: Array<{
    message: string
  }>
}

interface BeehiivPost {
  title: string
  subtitle?: string
  body_content: string  // HTML content
  status?: 'draft' | 'confirmed' | 'archived'
  scheduled_at?: string  // ISO 8601 date
}

interface BeehiivPostResponse {
  data?: {
    id: string
    title: string
    subtitle: string | null
    status: string
    publish_date: string | null
    web_url: string
    stats?: {
      email_sent: number
      email_open_rate: number
      email_click_rate: number
    }
  }
  errors?: Array<{ message: string }>
}

export async function subscribeToNewsletter(subscriber: BeehiivSubscriber): Promise<BeehiivResponse> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    throw new Error('Beehiiv API key or publication ID not configured')
  }

  const response = await fetch(
    `${BEEHIIV_API_URL}/publications/${publicationId}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: subscriber.utm_source || 'website',
        utm_medium: subscriber.utm_medium || 'organic',
        custom_fields: subscriber.custom_fields
          ? Object.entries(subscriber.custom_fields).map(([name, value]) => ({ name, value }))
          : undefined,
      }),
    }
  )

  return response.json()
}

export async function getSubscriberCount(): Promise<number> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    return 0
  }

  try {
    const response = await fetch(
      `${BEEHIIV_API_URL}/publications/${publicationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    const data = await response.json()
    return data.data?.subscriber_count || 0
  } catch {
    return 0
  }
}

/**
 * Create a newsletter post/draft in Beehiiv
 * Note: Requires Enterprise plan for Send API access
 */
export async function createPost(post: BeehiivPost): Promise<BeehiivPostResponse> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    throw new Error('Beehiiv API key or publication ID not configured')
  }

  const response = await fetch(
    `${BEEHIIV_API_URL}/publications/${publicationId}/posts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        subtitle: post.subtitle,
        body_content: post.body_content,
        status: post.status || 'draft',
        scheduled_at: post.scheduled_at,
      }),
    }
  )

  return response.json()
}

/**
 * List all posts from the publication
 */
export async function getPosts(options?: {
  status?: 'draft' | 'confirmed' | 'archived'
  limit?: number
}): Promise<{ data: BeehiivPostResponse['data'][], has_more: boolean }> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    throw new Error('Beehiiv API key or publication ID not configured')
  }

  const params = new URLSearchParams()
  if (options?.status) params.append('status', options.status)
  if (options?.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${BEEHIIV_API_URL}/publications/${publicationId}/posts?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  )

  return response.json()
}

/**
 * Get a specific post with stats
 */
export async function getPost(postId: string): Promise<BeehiivPostResponse> {
  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID

  if (!apiKey || !publicationId) {
    throw new Error('Beehiiv API key or publication ID not configured')
  }

  const response = await fetch(
    `${BEEHIIV_API_URL}/publications/${publicationId}/posts/${postId}?expand=stats`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  )

  return response.json()
}
