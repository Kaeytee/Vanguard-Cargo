import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Vanguard Cargo <noreply@vanguardcargo.co>";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, prefer, x-requested-with"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const body = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    if (!body.email || !body.firstName) {
      return new Response(JSON.stringify({
        error: "Missing required fields (email, firstName)"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // ---------- EMAIL HTML TEMPLATE ----------
    const baseTemplate = (title: string, content: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${title}</title>
        <style>
          body {
            background-color: #f7f7f7;
            font-family: 'Poppins', Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          }
          .header {
            background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
            text-align: center;
            padding: 40px 20px;
          }
          .header img {
            display: block;
            margin: 0 auto 15px;
            width: 180px;
            height: auto;
            filter: brightness(0) invert(1);
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            color: #ffffff;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.8;
          }
          .content p {
            margin: 15px 0;
            font-size: 16px;
          }
          .highlight-box {
            background: #f8f9fa;
            border-left: 4px solid #d32f2f;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: #d32f2f;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .btn:hover {
            background-color: #b71c1c;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 13px;
            color: #777;
            background-color: #f2f2f2;
          }
          .footer a {
            color: #d32f2f;
            text-decoration: none;
          }
          .check-icon {
            color: #4caf50;
            font-size: 20px;
            margin-right: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <img src="https://www.vanguardcargo.co/favicon.ico" alt="Vanguard Cargo Logo" />
            <h1>${title}</h1>
          </div>

          <!-- Body -->
          <div class="content">
            ${content}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@vanguardcargo.co">support@vanguardcargo.co</a></p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://www.vanguardcargo.co">Vanguard Cargo</a> | All rights reserved</p>
          </div>
        </div>
      </body>
    </html>`;

    // ---------- WELCOME EMAIL CONTENT ----------
    const welcomeContent = `
      <p>Dear ${body.firstName},</p>
      
      <p><strong>Welcome to Vanguard Cargo!</strong> 🎉</p>
      
      <p>Your email has been successfully verified and your account is now active. We're excited to help you shop from US stores and ship your packages to Ghana with ease.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 18px; font-weight: 600; color: #d32f2f;">✓ Account Successfully Created</p>
      </div>

      <p><strong>What's Next?</strong></p>
      <p>Log in to your dashboard to:</p>
      <ul style="line-height: 2;">
        <li><span class="check-icon">✓</span> Get your FREE US shipping address</li>
        <li><span class="check-icon">✓</span> Start shopping from your favorite US stores</li>
        <li><span class="check-icon">✓</span> Track your packages in real-time</li>
        <li><span class="check-icon">✓</span> Consolidate multiple packages to save on shipping</li>
      </ul>

      <p style="text-align:center;">
        <a href="https://www.vanguardcargo.co/login" class="btn">Login to Your Dashboard</a>
      </p>

      <p><strong>Need assistance?</strong></p>
      <p>Our support team is here to help you every step of the way. If you have any questions or need guidance on how to use our service, don't hesitate to reach out at <a href="mailto:support@vanguardcargo.co" style="color: #d32f2f;">support@vanguardcargo.co</a></p>

      <p>Thank you for choosing Vanguard Cargo. We look forward to serving you!</p>

      <p>Best regards,<br/>
      <strong>The Vanguard Cargo Team</strong></p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [body.email],
      subject: "Welcome to Vanguard Cargo – Your Account is Active! 🎉",
      html: baseTemplate("Welcome to Vanguard Cargo!", welcomeContent)
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Welcome email sent successfully"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
