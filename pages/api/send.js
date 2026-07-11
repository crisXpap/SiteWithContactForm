import { Resend } from 'resend';

// This grabs your API key from the environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message } = req.body;

    const { data, error } = await resend.emails.send({
      // Use an address at your verified domain (e.g., info@zilver-patisserie.com)
      from: 'zilver-patisserie.vercel.app', 
      // The email address where you want to receive the leads
      to: 'zilver.patisserie@gmail.com',    
      subject: 'New Lead from Zilver Website',
      html: `
        <h1>New Contact Request</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><small>Sent from: https://zilver-patisserie.vercel.app/</small></p>
      `
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ success: false, error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: error.message });
  }
}