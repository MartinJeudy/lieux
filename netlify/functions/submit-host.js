// netlify/functions/submit-host.js
exports.handler = async (event, context) => {
  // Autoriser uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Validation basique
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Construire le payload pour n8n selon la structure attendue
    const payload = {
      email: data.email,
      password: data.password,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        signupReason: "find-artists",
        isCommercialCommunicationAccepted: data.emailConsent || false
      }
    };

    // Appel vers n8n avec le header d'authentification et l'URL sécurisés
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result })
    };

  } catch (error) {
    console.error('Error submitting to n8n:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit form', details: error.message })
    };
  }
};
