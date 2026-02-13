/* ═══════════════════════════════════════════════════════════════
   NOMOΣ — withAuth Wrapper (Compatibility Layer)
   Wraps verifyAuth for backward compatibility with Phase 3-9 code
   Supports 2 patterns:
   1. export const GET = withAuth(async (req, { params, user }) => {...})
   2. return withAuth(request, async (user) => {...})
   ═══════════════════════════════════════════════════════════════ */

const { verifyAuth } = require('./auth');
const { NextResponse } = require('next/server');

/**
 * withAuth wrapper for backward compatibility
 * Auto-detects pattern based on arguments
 */
function withAuth(handlerOrRequest, callbackOrContext) {
  // Pattern 2: withAuth(request, async (user) => {...})
  // First arg is Request object, second is callback
  if (handlerOrRequest && typeof handlerOrRequest.headers === 'object' && typeof callbackOrContext === 'function') {
    return (async () => {
      try {
        const user = await verifyAuth(handlerOrRequest);
        
        if (!user) {
          return NextResponse.json(
            { error: 'Non autorisé' }, 
            { status: 401 }
          );
        }
        
        return await callbackOrContext(user);
      } catch (error) {
        console.error('withAuth error:', error);
        return NextResponse.json(
          { error: 'Erreur serveur' }, 
          { status: 500 }
        );
      }
    })();
  }
  
  // Pattern 1: export const GET = withAuth(async (req, { params, user }) => {...})
  // First arg is handler function
  const handler = handlerOrRequest;
  return async (request, context) => {
    try {
      const user = await verifyAuth(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Non autorisé' }, 
          { status: 401 }
        );
      }
      
      // Call the original handler with the expected signature
      return await handler(request, {
        params: context?.params || {},
        user: user
      });
    } catch (error) {
      console.error('withAuth error:', error);
      return NextResponse.json(
        { error: 'Erreur serveur' }, 
        { status: 500 }
      );
    }
  };
}

module.exports = { withAuth };
