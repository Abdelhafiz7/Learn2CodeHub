using System;

namespace API.Helpers
{
    public static class EmailTemplates
    {
        private const string PrimaryColor = "#6366f1"; // Indigo 500
        private const string SecondaryColor = "#4f46e5"; // Indigo 600
        private const string BackgroundColor = "#f8fafc"; // Slate 50
        private const string CardColor = "#ffffff";
        private const string TextColor = "#0f172a"; // Slate 900
        private const string MutedTextColor = "#64748b"; // Slate 500
        private const string BorderColor = "#e2e8f0"; // Slate 200

        private static string GetBaseWrapper(string title, string content)
        {
            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        body {{ 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: {BackgroundColor}; 
            margin: 0; 
            padding: 0; 
            width: 100% !important; 
            -webkit-font-smoothing: antialiased;
        }}
        
        .wrapper {{ 
            width: 100%; 
            table-layout: fixed; 
            background-color: {BackgroundColor}; 
            padding: 40px 0; 
        }}
        
        .main {{ 
            background-color: {CardColor}; 
            margin: 0 auto; 
            width: 100%; 
            max-width: 600px; 
            border-spacing: 0; 
            border-radius: 32px; 
            overflow: hidden; 
            border: 1px solid {BorderColor};
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }}
        
        .header {{ 
            background: linear-gradient(135deg, {PrimaryColor} 0%, {SecondaryColor} 100%);
            padding: 60px 40px; 
            text-align: center; 
        }}
        
        .header h1 {{ 
            color: #ffffff; 
            margin: 0; 
            font-size: 32px; 
            font-weight: 800; 
            letter-spacing: -0.04em; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        
        .content {{ 
            padding: 50px 40px; 
            line-height: 1.6; 
            color: {TextColor}; 
        }}
        
        .content h2 {{ 
            font-size: 26px; 
            font-weight: 800; 
            margin-bottom: 24px; 
            color: #020617; 
            letter-spacing: -0.02em;
        }}
        
        .content p {{ 
            margin-bottom: 24px; 
            font-size: 16px; 
            color: {MutedTextColor};
            font-weight: 400;
        }}
        
        .cta-container {{ 
            text-align: center; 
            margin: 40px 0; 
        }}
        
        .button {{ 
            background-color: {PrimaryColor}; 
            color: #ffffff !important; 
            padding: 18px 40px; 
            border-radius: 16px; 
            text-decoration: none; 
            font-weight: 700; 
            font-size: 16px; 
            display: inline-block; 
            box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
        }}
        
        .footer {{ 
            text-align: center; 
            padding: 40px; 
            color: {MutedTextColor}; 
            font-size: 14px; 
            background-color: #fcfcfd;
            border-top: 1px solid {BorderColor};
        }}
        
        .footer a {{ 
            color: {PrimaryColor}; 
            text-decoration: none; 
            font-weight: 600;
        }}
        
        .divider {{ 
            border-top: 1px solid {BorderColor}; 
            margin: 40px 0; 
        }}

        .link-text {{
            font-family: monospace;
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            color: {MutedTextColor};
            word-break: break-all;
            display: block;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class='wrapper'>
        <table class='main' align='center'>
            <tr>
                <td class='header'>
                    <h1>Learn2CodeHub</h1>
                </td>
            </tr>
            <tr>
                <td class='content'>
                    {content}
                </td>
            </tr>
            <tr>
                <td class='footer'>
                    <p>&copy; {DateTime.UtcNow.Year} Learn2CodeHub. All rights reserved.</p>
                    <p>Questions? Contact us at <a href='mailto:support@learn2codehub.com'>support@learn2codehub.com</a></p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>";
        }

        public static string GetVerificationEmail(string name, string link)
        {
            var content = $@"
                <h2>Welcome to the hub, {name}!</h2>
                <p>We're thrilled to have you join our community of learners. To get started and unlock all features, please verify your email address.</p>
                <div class='cta-container'>
                    <a href='{link}' class='button'>Verify My Account</a>
                </div>
                <p>If the button doesn't work, copy and paste this link:</p>
                <span class='link-text'>{link}</span>
                <div class='divider'></div>
                <p style='font-size: 14px;'>This link will expire in 24 hours. If you didn't sign up for Learn2CodeHub, you can safely ignore this.</p>";
            
            return GetBaseWrapper("Verify Your Email", content);
        }

        public static string GetForgotPasswordEmail(string name, string link)
        {
            var content = $@"
                <h2>Reset your password</h2>
                <p>Hi {name}, we received a request to reset your password. No worries, it happens to the best of us! Click the button below to set a new one.</p>
                <div class='cta-container'>
                    <a href='{link}' class='button'>Reset My Password</a>
                </div>
                <p>If the button doesn't work, copy and paste this link:</p>
                <span class='link-text'>{link}</span>
                <div class='divider'></div>
                <p style='font-size: 14px;'>This link will expire in 1 hour. If you didn't request a reset, your password will remain unchanged.</p>";

            return GetBaseWrapper("Reset Your Password", content);
        }

        public static string GetEmailChangeEmail(string name, string link)
        {
            var content = $@"
                <h2>Confirm your new email</h2>
                <p>Hi {name}, you've requested to update your account email. Please confirm this change to ensure you continue receiving important updates.</p>
                <div class='cta-container'>
                    <a href='{link}' class='button'>Confirm Email Change</a>
                </div>
                <p>If the button doesn't work, copy and paste this link:</p>
                <span class='link-text'>{link}</span>
                <div class='divider'></div>
                <p style='font-size: 14px;'>This security measure ensures your account remains protected. If you didn't request this, please contact support.</p>";

            return GetBaseWrapper("Confirm Email Change", content);
        }

        public static string GetAccountDeactivatedEmail(string name)
        {
            var content = $@"
                <h2 style='color: #ef4444;'>Account Deactivated</h2>
                <p>Hi {name}, your account on Learn2CodeHub has been deactivated by an administrator.</p>
                <p>If you believe this is a mistake or would like to discuss the deactivation, our support team is here to help.</p>
                <div class='divider'></div>
                <p style='font-size: 14px;'>This is an automated security notice. Please do not reply.</p>";

            return GetBaseWrapper("Account Status Update", content);
        }

        public static string GetAccountReactivatedEmail(string name)
        {
            var content = $@"
                <h2 style='color: #10b981;'>Welcome back! ✅</h2>
                <p>Hi {name}, your account on Learn2CodeHub has been reactivated. We're glad to have you back in the community!</p>
                <p>You can now sign in and continue your learning journey exactly where you left off.</p>
                <div class='cta-container'>
                    <a href='http://localhost:5173/login' class='button'>Sign In Now</a>
                </div>
                <div class='divider'></div>
                <p style='font-size: 14px;'>Happy coding!</p>";

            return GetBaseWrapper("Account Status Update", content);
        }
    }
}
