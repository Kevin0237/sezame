const { env } = require('../config/env')
const { query } = require('../config/db')

async function sendVerificationEmail({ to, token }) {
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${token}`

  if (!env.brevoApiKey) {
    console.log('[email:dev] Verification link (no BREVO_API_KEY):', verifyUrl)
    return { dev: true, verifyUrl }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
        to: [{ email: to }],
        subject: 'Confirmez votre adresse e-mail — Sezame',
        htmlContent: `
          <p>Bonjour,</p>
          <p>Merci de vous être inscrit sur <strong>Sezame</strong>.</p>
          <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
          <p><a href="${verifyUrl}">Confirmer mon e-mail</a></p>
          <p>Ce lien expire dans 24 heures.</p>
          <p>— L'équipe Sezame</p>
        `,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[email] Brevo error:', response.status, errBody)
    } else {
      console.log('[email] Verification email sent to', to)
      return { sent: true }
    }
  } catch (err) {
    console.error('[email] Brevo request failed:', err.message)
  }

  console.log('[email:fallback] Verification link:', verifyUrl)
  return { dev: true, verifyUrl, warning: 'Email send failed; link logged to server console.' }
}

async function sendApplicationStatusEmail({ to, offerTitle, statusLabel }) {
  if (!env.brevoApiKey) {
    console.log('[email:dev] Application status email (no BREVO_API_KEY):', { to, offerTitle, statusLabel })
    return { dev: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
        to: [{ email: to }],
        subject: `Mise à jour de votre candidature — ${offerTitle}`,
        htmlContent: `
          <p>Bonjour,</p>
          <p>Le statut de votre candidature pour le poste <strong>${offerTitle}</strong> a été mis à jour.</p>
          <p><strong>Nouveau statut :</strong> ${statusLabel}</p>
          <p>Connectez-vous à Sezame pour plus de détails.</p>
          <p>— L'équipe Sezame</p>
        `,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[email] Brevo error:', response.status, errBody)
    } else {
      console.log('[email] Application status email sent to', to)
      return { sent: true }
    }
  } catch (err) {
    console.error('[email] Brevo request failed:', err.message)
  }

  return { dev: true, warning: 'Email send failed; logged to server console.' }
}

async function sendVerificationStatusEmail({ userId, companyName, status }) {
  const userResult = await query('SELECT email FROM users WHERE id = $1', [userId])
  if (!userResult.rows.length) return { dev: true }

  const to = userResult.rows[0].email
  const approved = status === 'verified'
  const subject = approved
    ? `Votre entreprise « ${companyName} » est vérifiée — Sezame`
    : `Votre demande de vérification « ${companyName} » a été refusée — Sezame`

  const htmlContent = approved
    ? `<p>Bonjour,</p>
       <p>Félicitations ! Votre entreprise <strong>${companyName}</strong> a été vérifiée avec succès.</p>
       <p>Vous pouvez désormais publier des offres d'emploi sur Sezame.</p>
       <p>— L'équipe Sezame</p>`
    : `<p>Bonjour,</p>
       <p>Votre demande de vérification pour <strong>${companyName}</strong> a été refusée.</p>
       <p>Veuillez contacter le support pour plus d'informations ou soumettre à nouveau vos documents.</p>
       <p>— L'équipe Sezame</p>`

  if (!env.brevoApiKey) {
    console.log('[email:dev] Verification status email (no BREVO_API_KEY):', { to, status, companyName })
    return { dev: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[email] Brevo error:', response.status, errBody)
    } else {
      console.log('[email] Verification status email sent to', to)
      return { sent: true }
    }
  } catch (err) {
    console.error('[email] Brevo request failed:', err.message)
  }

  return { dev: true, warning: 'Email send failed; logged to server console.' }
}

module.exports = { sendVerificationEmail, sendApplicationStatusEmail, sendVerificationStatusEmail }
