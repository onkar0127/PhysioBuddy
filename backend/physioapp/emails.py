import logging
import threading
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def _send_email_async(subject, text_content, html_content, recipient_email):
    """
    Internal worker to deliver email via Django SMTP without blocking request loop.
    """
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', 'no-reply@physiobuddy.com')
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"[Email Notification] Successfully sent credentials email to {recipient_email}")
    except Exception as exc:
        logger.error(f"[Email Notification Error] Failed to send email to {recipient_email}: {exc}", exc_info=True)


def send_credentials_email(user_email, full_name, username, temp_password, role='doctor', hospital_name='PhysioBuddy Clinic'):
    """
    Sends a styled welcome email containing initial login credentials to a new Doctor or Patient.
    Dispatches asynchronously in a background thread to prevent latency in HTTP API responses.
    """
    if not user_email:
        logger.warning("[Email Notification] Recipient email is empty, skipping email dispatch.")
        return

    # Check if SMTP configuration is configured
    host_user = getattr(settings, 'EMAIL_HOST_USER', '')
    host_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    if not host_user or not host_password:
        logger.warning(
            f"[Email Notification] EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not configured. "
            f"Would have sent credentials to {user_email} (Username: {username}, Password: {temp_password})."
        )
        # Note: If email backend is console/dummy backend during tests, proceed anyway
        if 'smtp' in getattr(settings, 'EMAIL_BACKEND', '').lower():
            logger.info("[Email Notification] Skipping SMTP dispatch because EMAIL_HOST_USER / EMAIL_HOST_PASSWORD are not set in environment.")
            return

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    login_url = f"{frontend_url}/login"

    role_title = "Doctor" if role.lower() == 'doctor' else ("Patient" if role.lower() == 'patient' else "User")
    greeting_name = f"Dr. {full_name}" if role.lower() == 'doctor' else full_name

    subject = f"Welcome to PhysioBuddy - Your {role_title} Account Credentials ({hospital_name})"

    # Plain text version for non-HTML mail clients
    text_content = f"""
Hello {greeting_name},

Welcome to PhysioBuddy! Your {role_title.lower()} account has been created for {hospital_name}.

Here are your account login credentials:
----------------------------------------
Portal URL: {login_url}
Username / Email: {username} ({user_email})
Temporary Password: {temp_password}
Role: {role_title}
Hospital/Clinic: {hospital_name}
----------------------------------------

Please log in using the temporary password above and change your password upon your first session.

Log In Now: {login_url}

Best regards,
The PhysioBuddy & {hospital_name} Team
    """.strip()

    # Premium HTML Template
    badge_color = "#059669" if role.lower() == 'doctor' else "#0284c7"
    badge_bg = "#ecfdf5" if role.lower() == 'doctor' else "#f0f9ff"
    portal_accent = "#10b981" if role.lower() == 'doctor' else "#06b6d4"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px; text-align: center;">
              <div style="display: inline-block; font-size: 26px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">
                🏃‍♂️ Physio<span style="color: #34d399;">Buddy</span>
              </div>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                AI-Powered Rehabilitation &amp; Clinical Management
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              
              <!-- Role Badge -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 14px; font-size: 12px; font-weight: 700; color: {badge_color}; background-color: {badge_bg}; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.8px;">
                  {role_title} Account Activated
                </span>
              </div>

              <!-- Greeting -->
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                Welcome, {greeting_name}!
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Your account has been officially registered with <strong style="color: #0f172a;">{hospital_name}</strong> on the PhysioBuddy platform. Below are your initial login credentials to access the portal.
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1; padding: 22px 24px; margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                  🔐 Your Login Credentials
                </div>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Username:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 15px; font-weight: 700;">{username}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td>
                    <td style="padding: 6px 0; color: #0f172a;">{user_email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Temporary Password:</td>
                    <td style="padding: 6px 0;">
                      <span style="display: inline-block; background-color: #f1f5f9; border: 1px dashed #94a3b8; color: #0f172a; font-family: monospace; font-size: 15px; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">
                        {temp_password}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Hospital / Clinic:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{hospital_name}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="{login_url}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35); letter-spacing: 0.2px;">
                  🚀 Log In to Your Portal
                </a>
              </div>

              <!-- Security Notice Alert -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 16px; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 3px;">
                  🛡️ Security Tip
                </div>
                <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
                  For security reasons, please change your temporary password immediately after logging in for the first time.
                </div>
              </div>

              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                If you have any questions or did not expect this invitation, please contact your clinic administrator at <strong>{hospital_name}</strong>.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 36px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
              <div>&copy; PhysioBuddy AI Tele-Rehabilitation &bull; All Rights Reserved.</div>
              <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1;">
                This email was sent to {user_email} because an account was registered with {hospital_name}.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """.strip()

    # Launch in a background thread
    thread = threading.Thread(
        target=_send_email_async,
        args=(subject, text_content, html_content, user_email),
        daemon=True
    )
    thread.start()


def send_password_reset_email(user_email, full_name, username, temp_password, role='doctor', hospital_name='PhysioBuddy'):
    """
    Sends a styled password reset email containing a newly generated temporary password.
    Dispatches asynchronously in a background thread.
    """
    if not user_email:
        logger.warning("[Password Reset Email] Recipient email is empty, skipping dispatch.")
        return

    # Check if SMTP configuration is configured
    host_user = getattr(settings, 'EMAIL_HOST_USER', '')
    host_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    if not host_user or not host_password:
        logger.warning(
            f"[Password Reset Email] EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not configured. "
            f"Would have sent reset password to {user_email} (Username: {username}, Password: {temp_password})."
        )
        if 'smtp' in getattr(settings, 'EMAIL_BACKEND', '').lower():
            logger.info("[Password Reset Email] Skipping SMTP dispatch because EMAIL_HOST_USER / EMAIL_HOST_PASSWORD are not set in environment.")
            return

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    login_url = f"{frontend_url}/login"

    role_title = "Doctor" if role.lower() == 'doctor' else ("Patient" if role.lower() == 'patient' else ("Hospital Admin" if 'hospital' in role.lower() else "User"))
    greeting_name = f"Dr. {full_name}" if role.lower() == 'doctor' else full_name

    subject = "PhysioBuddy - Password Reset & Temporary Login Password"

    # Plain text version
    text_content = f"""
Hello {greeting_name},

We received a request to reset the password for your PhysioBuddy account ({hospital_name}).

Your account has been updated with a new temporary password:
----------------------------------------
Portal URL: {login_url}
Username / Login ID: {username}
Registered Email: {user_email}
New Temporary Password: {temp_password}
Role: {role_title}
Hospital/Clinic: {hospital_name}
----------------------------------------

Please log in to your portal using the temporary password above and update your password immediately in your Profile settings.

Log In: {login_url}

If you did not request this password reset, please contact your clinic administrator or support team immediately.

Best regards,
The PhysioBuddy Security Team
    """.strip()

    # Premium HTML Template
    badge_color = "#d97706"
    badge_bg = "#fef3c7"

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px; text-align: center;">
              <div style="display: inline-block; font-size: 26px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">
                🏃‍♂️ Physio<span style="color: #34d399;">Buddy</span>
              </div>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                Account Security &amp; Access Recovery
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              
              <!-- Badge -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 14px; font-size: 12px; font-weight: 700; color: {badge_color}; background-color: {badge_bg}; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.8px;">
                  🔐 Password Reset Requested
                </span>
              </div>

              <!-- Greeting -->
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                Hello, {greeting_name}
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                A password reset request was received for your <strong style="color: #0f172a;">{hospital_name}</strong> account on PhysioBuddy. Your account has been temporarily updated with the login credentials below.
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1; padding: 22px 24px; margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                  🔑 New Temporary Credentials
                </div>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Username:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 15px; font-weight: 700;">{username}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Account Email:</td>
                    <td style="padding: 6px 0; color: #0f172a;">{user_email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Temporary Password:</td>
                    <td style="padding: 6px 0;">
                      <span style="display: inline-block; background-color: #fef3c7; border: 1px dashed #d97706; color: #92400e; font-family: monospace; font-size: 16px; font-weight: 800; padding: 6px 12px; border-radius: 6px; letter-spacing: 0.5px;">
                        {temp_password}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Role / Affiliation:</td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{role_title} &bull; {hospital_name}</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="{login_url}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35); letter-spacing: 0.2px;">
                  🚀 Sign In with Temporary Password
                </a>
              </div>

              <!-- Security Notice Alert -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 16px; margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 3px;">
                  🛡️ Security Requirement
                </div>
                <div style="font-size: 13px; color: #78350f; line-height: 1.5;">
                  Please update your temporary password to a permanent, secure password under your <strong>Profile Settings</strong> immediately after logging in.
                </div>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not initiate this request, please contact your clinic administrator or reach out to PhysioBuddy Support immediately.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 36px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
              <div>&copy; PhysioBuddy AI Tele-Rehabilitation &bull; All Rights Reserved.</div>
              <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1;">
                This security notification was dispatched to {user_email}.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """.strip()

    thread = threading.Thread(
        target=_send_email_async,
        args=(subject, text_content, html_content, user_email),
        daemon=True
    )
    thread.start()

