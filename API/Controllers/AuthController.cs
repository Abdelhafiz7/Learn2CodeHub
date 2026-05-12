using System.Data;
using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Enums;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Helpers;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly WebContext _context;
        private readonly JwtService _jwtService;
        private readonly PasswordService _passwordService;
        private readonly EmailService _emailService;

        public AuthController(WebContext context, JwtService jwtService, PasswordService passwordService, EmailService emailService)
        {
            _context = context;
            _jwtService = jwtService;
            _passwordService = passwordService;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _context.Users
    .AnyAsync(u =>
        u.Email == registerDto.Email &&
        !u.IsDeleted);
            if (exists)
                return BadRequest("Email already in use");

            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = _passwordService.HashPassword(registerDto.Password),
                Role = registerDto.Role
            };

            var verificationToken = Guid.NewGuid().ToString();

            user.EmailVerificationToken = verificationToken;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var link = $"http://localhost:5173/verify-email?token={verificationToken}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Verify Your Email",
                EmailTemplates.GetVerificationEmail(user.FirstName, link)
            );

            var jwtToken = _jwtService.GenerateToken(user.Id, user.Email, user.Role);

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                role = user.Role.ToString(),
                token = jwtToken
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
    x.Email == loginDto.Email &&
    !x.IsDeleted);

            if (user == null)
                return Unauthorized("Invalid email or password");

            if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password");

            if (!user.isActive)
                return Unauthorized("Your account has been deactivated. Please contact support.");

            if (!user.EmailConfirmed)
            {
                return BadRequest(new
                {
                    message = "Email not verified",
                    email = user.Email
                });
            }

            var token = _jwtService.GenerateToken(user.Id, user.Email, user.Role);

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    Role = user.Role.ToString(),
                    user.FirstName,
                    user.LastName,
                }
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Invalid token");

            var user = await _context.Users.FindAsync(int.Parse(userIdClaim));

            if (user.IsDeleted)
                return Unauthorized("Account deleted");

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                role = user.Role.ToString(),
                user.FirstName,
                user.LastName,
                user.Bio,
                user.ProfileImageUrl,

                githubUrl = user.Role == UserRole.Instructor ? user.GithubUrl : null,
                twitterUrl = user.Role == UserRole.Instructor ? user.TwitterUrl : null,
                linkedInUrl = user.Role == UserRole.Instructor ? user.LinkedInUrl : null,
                youtubeUrl = user.Role == UserRole.Instructor ? user.YoutubeUrl : null,
                websiteUrl = user.Role == UserRole.Instructor ? user.WebsiteUrl : null,
                major = user.Role == UserRole.Instructor ? user.Major : null
            });
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public IActionResult RefreshToken([FromBody] string token)
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(token);

            var userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var email = principal.FindFirst(ClaimTypes.Email)!.Value;
            var role = Enum.Parse<UserRole>(principal.FindFirst(ClaimTypes.Role)!.Value);

            var newToken = _jwtService.GenerateToken(userId, email, role);

            return Ok(new { token = newToken });
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto updateProfileDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            user.FirstName = updateProfileDto.FirstName;
            user.LastName = updateProfileDto.LastName;
            user.Bio = updateProfileDto.Bio;
            user.ProfileImageUrl = updateProfileDto.ProfileImageUrl;

            if (user.Role == UserRole.Instructor)
            {
                user.GithubUrl = updateProfileDto.GithubUrl;
                user.TwitterUrl = updateProfileDto.TwitterUrl;
                user.LinkedInUrl = updateProfileDto.LinkedInUrl;
                user.YoutubeUrl = updateProfileDto.YoutubeUrl;
                user.WebsiteUrl = updateProfileDto.WebsiteUrl;
                user.Major = updateProfileDto.Major;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.FirstName,
                user.LastName,
                user.Bio,
                user.ProfileImageUrl,
                SocialLinks = user.Role == UserRole.Instructor ? new
                {
                    user.GithubUrl,
                    user.TwitterUrl,
                    user.LinkedInUrl,
                    user.YoutubeUrl,
                    user.WebsiteUrl,
                    user.Major
                } : null
            });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            if (!_passwordService.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("Current password is incorrect");
            }

            user.PasswordHash = _passwordService.HashPassword(changePasswordDto.NewPassword);

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgetPassword([FromBody] string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
    x.Email == email &&
    !x.IsDeleted);

            if (user == null)
                return Ok();

            var token = Guid.NewGuid().ToString();

            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            var link = $"http://localhost:5173/reset-password?token={token}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Reset Your Password",
                EmailTemplates.GetForgotPasswordEmail(user.FirstName, link)
            );

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(x =>
                x.PasswordResetToken == resetPasswordDto.Token &&
                x.PasswordResetTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return BadRequest("Invalid or expired token");

            user.PasswordHash = _passwordService.HashPassword(resetPasswordDto.NewPassword);

            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok("Password reset successful");
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(x =>
                    x.EmailVerificationToken == token &&
                    x.EmailVerificationTokenExpiry != null &&
                    x.EmailVerificationTokenExpiry > DateTime.UtcNow);

                if (user == null)
                    return BadRequest("Invalid or expired token");

                user.EmailConfirmed = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;

                await _context.SaveChangesAsync();

                return Ok("Email verified successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
    x.Email == email &&
    !x.IsDeleted);

            if (user == null || user.EmailConfirmed)
                return Ok();

            var token = Guid.NewGuid().ToString();

            user.EmailVerificationToken = token;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

            await _context.SaveChangesAsync();

            var link = $"http://localhost:5173/verify-email?token={token}&email={user.Email}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Verify Your Email",
                EmailTemplates.GetVerificationEmail(user.FirstName, link)
            );

            return Ok();
        }

        [HttpPost("request-email-change")]
        [Authorize]
        public async Task<IActionResult> RequestEmailChange([FromBody] string newEmail)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            if (await _context.Users.AnyAsync(x =>
    x.Email == newEmail &&
    !x.IsDeleted))
                return BadRequest("Email already in use");

            var token = Guid.NewGuid().ToString();

            user.PendingEmail = newEmail;
            user.ChangeEmailToken = token;
            user.ChangeEmailTokenExpiry = DateTime.UtcNow.AddHours(24);

            await _context.SaveChangesAsync();

            var link = $"http://localhost:5173/confirm-email-change?token={token}";

            await _emailService.SendEmailAsync(
                newEmail,
                "Confirm Your Email Change",
                EmailTemplates.GetEmailChangeEmail(user.FirstName, link)
            );
            return Ok();
        }

        [HttpGet("confirm-email-change")]
        public async Task<IActionResult> ConfirmEmailChange([FromQuery] string token)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x =>
                x.ChangeEmailToken == token &&
                x.ChangeEmailTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return BadRequest("Invalid or expired token");

            user.Email = user.PendingEmail!;
            user.PendingEmail = null;
            user.ChangeEmailToken = null;
            user.ChangeEmailTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok("Email changed successful");
        }
    }
}