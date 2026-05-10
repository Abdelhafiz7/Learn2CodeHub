using System;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace API.Services;

public class EmailService
{
    private readonly string _apiKey;

    public EmailService(IConfiguration config)
    {
        _apiKey = config["SendGrid:ApiKey"];
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var client = new SendGridClient(_apiKey);

        var from = new EmailAddress("3bdul7afiz@gmail.com", "Learn2CodeHub");
        var to = new EmailAddress(toEmail);

        var msg = MailHelper.CreateSingleEmail(from, to, subject, htmlContent, htmlContent);

        await client.SendEmailAsync(msg);
    }
}
