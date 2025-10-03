import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { draftCount, incrementDrafts } from '../../../lib/runState'

// Validation schema (all fields optional but if present must meet constraints)
const RunSchema = z.object({
  name: z.string().min(1, 'name cannot be empty').optional(),
  phone: z.string().min(3, 'phone too short').optional(),
  reason: z.string().min(1, 'reason required').optional(),
  action: z.string().min(1, 'action required').optional(),
  lang: z.enum(['en', 'lt']).optional()
})

type RunRequest = z.infer<typeof RunSchema>

export async function POST(request: NextRequest) {
  try {
  const start = Date.now()
  const json = await request.json().catch(() => ({}))
    const parsed = RunSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
  { ok: false, errors: parsed.error.issues.map((i: any) => ({ path: i.path.join('.'), message: i.message })) },
        { status: 400 }
      )
    }
    const { name = 'Customer', phone, reason = 'general inquiry', action = 'information', lang = 'en' } = parsed.data
    
    // Generate unique ID
    const id = uuidv4()
    
    // Infer intent based on reason and action
    const intent = inferIntent(reason, action)
    
    // Generate draft response based on language
    const draft = generateDraft(name, reason, action, lang)
    
  incrementDrafts()
    
    const latencyMs = Date.now() - start
    return NextResponse.json({
      ok: true,
      id,
      intent,
      draft,
      latency: latencyMs,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, errors: [{ message: 'Invalid JSON body' }] },
      { status: 400 }
    )
  }
}

function inferIntent(reason: string, action: string): string {
  const reasonLower = reason.toLowerCase()
  const actionLower = action.toLowerCase()
  
  if (actionLower.includes('booking') || reasonLower.includes('rezerv')) {
    return 'booking_request'
  }
  if (actionLower.includes('support') || reasonLower.includes('help')) {
    return 'support_request'
  }
  if (actionLower.includes('info') || reasonLower.includes('informacij')) {
    return 'information_request'
  }
  
  return 'general_inquiry'
}

function generateDraft(name: string, reason: string, action: string, lang: string): string {
  if (lang === 'lt') {
    return `Sveiki ${name},

Dėkojame už jūsų užklausą dėl "${reason}".

Mūsų komanda peržiūrės jūsų prašymą ir susisieks su jumis artimiausiu metu.

Jei turite skubų klausimą, galite skambinti mums tiesiogiai.

Pagarbiai,
Mūsų komanda`
  }
  
  // Default English
  return `Hello ${name},

Thank you for your inquiry regarding "${reason}".

Our team will review your request for ${action} and get back to you shortly.

If you have any urgent questions, please feel free to call us directly.

Best regards,
Our Team`
}