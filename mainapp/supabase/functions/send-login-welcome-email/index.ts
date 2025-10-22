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

    if (!body.email || !body.userId) {
      return new Response(JSON.stringify({
        error: "Missing required fields (email, userId)"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", body.userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw new Error("Unable to fetch user profile");
    }

    // Fetch warehouse address
    const { data: warehouse, error: warehouseError } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", profile.warehouse_id)
      .single();

    if (warehouseError) {
      console.error("Warehouse fetch error:", warehouseError);
      throw new Error("Unable to fetch warehouse details");
    }

    const firstName = profile.first_name || "Valued Customer";
    const lastName = profile.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Generate user's unique US address
    const userUSAddress = `
      ${fullName}<br/>
      ${warehouse.street_address || ""}${warehouse.suite ? `, ${warehouse.suite}` : ""}<br/>
      ${warehouse.city || ""}, ${warehouse.state || ""} ${warehouse.postal_code || ""}<br/>
      United States
    `;

    const ghanaAddress = profile.ghana_address 
      ? `${profile.ghana_address}${profile.ghana_city ? `, ${profile.ghana_city}` : ""}` 
      : "Not yet provided";

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
            max-width: 650px;
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
          .info-card {
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
          }
          .info-card h3 {
            margin: 0 0 15px 0;
            color: #d32f2f;
            font-size: 18px;
            font-weight: 600;
            border-bottom: 2px solid #d32f2f;
            padding-bottom: 10px;
          }
          .info-card .address-box {
            background: #ffffff;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.6;
            margin-top: 10px;
            border-left: 4px solid #d32f2f;
          }
          .highlight-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .steps {
            counter-reset: step-counter;
            list-style: none;
            padding-left: 0;
          }
          .steps li {
            counter-increment: step-counter;
            margin: 20px 0;
            padding-left: 50px;
            position: relative;
            line-height: 1.6;
          }
          .steps li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: #d32f2f;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
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
          .feature-list {
            background: #e8f5e9;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-list li {
            margin: 10px 0;
            padding-left: 10px;
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
            <p>Questions? Contact us at <a href="mailto:support@vanguardcargo.co">support@vanguardcargo.co</a></p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://www.vanguardcargo.co">Vanguard Cargo</a> | All rights reserved</p>
          </div>
        </div>
      </body>
    </html>`;

    // ---------- LOGIN WELCOME EMAIL CONTENT ----------
    const loginWelcomeContent = `
      <p>Dear ${firstName},</p>
      
      <p>Welcome back! We're thrilled to have you on board. Below you'll find everything you need to start shopping from US stores and shipping to Ghana effortlessly.</p>

      <!-- YOUR US SHIPPING ADDRESS -->
      <div class="info-card">
        <h3>📦 Your FREE US Shipping Address</h3>
        <p>Use this address when checking out at any US online store:</p>
        <div class="address-box">
          ${userUSAddress}
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #666;">
          <strong>Important:</strong> Always use your full name exactly as it appears on your account.
        </p>
      </div>

      <!-- YOUR GHANA DELIVERY ADDRESS -->
      <div class="info-card">
        <h3>🏠 Your Ghana Delivery Address</h3>
        <div class="address-box">
          ${ghanaAddress}
        </div>
        ${!profile.ghana_address ? `
        <p style="margin-top: 15px; font-size: 14px; color: #e65100;">
          <strong>⚠️ Action Required:</strong> Please update your Ghana delivery address in your dashboard settings.
        </p>
        ` : ''}
      </div>

      <!-- HOW TO USE OUR SERVICE -->
      <h3 style="color: #d32f2f; font-size: 20px; margin-top: 30px;">🚀 How to Use Vanguard Cargo</h3>
      
      <ol class="steps">
        <li><strong>Shop from US Stores:</strong> Browse your favorite US online stores (Amazon, eBay, Walmart, Target, etc.) and add items to your cart.</li>
        
        <li><strong>Use Your US Address:</strong> At checkout, enter your unique US shipping address (shown above) as the delivery address.</li>
        
        <li><strong>We Receive Your Package:</strong> Your package arrives at our US warehouse. We'll send you a notification immediately.</li>
        
        <li><strong>Review & Ship:</strong> Log in to your dashboard, review your packages, consolidate if needed, and request shipment to Ghana.</li>
        
        <li><strong>Track Delivery:</strong> Track your shipment in real-time until it arrives at your doorstep in Ghana.</li>
      </ol>

      <!-- SPECIAL SERVICES -->
      <div class="highlight-box">
        <h3 style="margin: 0 0 15px 0; color: #e65100; font-size: 18px;">🛍️ Want Us to Shop for You?</h3>
        <p style="margin: 0;">Don't have a US payment method? No problem! Our team can purchase items on your behalf.</p>
        <p style="margin: 10px 0 0 0;">Simply reach out to us at <a href="mailto:support@vanguardcargo.co" style="color: #d32f2f; font-weight: 600;">support@vanguardcargo.co</a> with:</p>
        <ul style="margin: 10px 0 0 20px; line-height: 1.8;">
          <li>Product link(s) from the US store</li>
          <li>Quantity and size/color preferences</li>
          <li>Your budget</li>
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 14px;">We'll handle the rest and keep you updated throughout the process!</p>
      </div>

      <!-- KEY FEATURES -->
      <h3 style="color: #d32f2f; font-size: 20px; margin-top: 30px;">✨ Key Features</h3>
      <div class="feature-list">
        <ul>
          <li>✓ <strong>Package Consolidation:</strong> Combine multiple packages into one shipment to save on costs</li>
          <li>✓ <strong>Real-Time Tracking:</strong> Monitor your shipment from US to Ghana</li>
          <li>✓ <strong>Secure Storage:</strong> FREE storage at our warehouse for up to 30 days</li>
          <li>✓ <strong>Professional Packaging:</strong> We repack items securely for international shipping</li>
          <li>✓ <strong>Custom Declarations:</strong> We handle all customs paperwork for you</li>
        </ul>
      </div>

      <p style="text-align:center; margin-top: 35px;">
        <a href="https://www.vanguardcargo.co/dashboard" class="btn">Go to Your Dashboard</a>
      </p>

      <p style="margin-top: 30px;">If you have any questions or need assistance, our support team is here to help 24/7.</p>

      <p>Happy shopping! 🎉</p>

      <p>Best regards,<br/>
      <strong>The Vanguard Cargo Team</strong></p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [body.email],
      subject: "Your Vanguard Cargo Account Details & How to Get Started 📦",
      html: baseTemplate("Your Account Details & Getting Started Guide", loginWelcomeContent)
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Login welcome email sent successfully"
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
