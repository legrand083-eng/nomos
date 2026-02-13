import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email-engine';

export async function POST(request) {
  try {
    const user = await verifyToken(request);
    
    if (!user || !['admin', 'moe'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { templateCode, destinataireEmail, variables } = await request.json();
    
    if (!templateCode || !destinataireEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Send test email
    const result = await sendEmail({
      tenantId: user.tenant_id,
      templateCode,
      destinataireEmail,
      destinataireName: 'Test',
      variables: variables || {}
    });
    
    return NextResponse.json({ success: true, emailLog: result });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
