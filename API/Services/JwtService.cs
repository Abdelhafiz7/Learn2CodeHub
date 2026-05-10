using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using API.Data;
using API.Enums;
using API.Models;
using API.Services;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class JwtService
{
    private readonly WebContext _dbcontext;
    private readonly IConfiguration _configuration;
    private readonly PasswordService _passwordService;

    public JwtService(WebContext db, IConfiguration configuration, PasswordService passwordService)
    {
        _dbcontext = db;
        _configuration = configuration;
        _passwordService = passwordService;
    }

    public async Task<AuthResponse?> Authenticate(LoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            return null;

        var user = await _dbcontext.Users
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null)
            return null;

        if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
            return null;

        var key = _configuration["JwtConfig:Key"];
        var issuer = _configuration["JwtConfig:Issuer"];
        var audience = _configuration["JwtConfig:Audience"];
        var expiry = DateTime.UtcNow.AddMinutes(
            _configuration.GetValue<int>("JwtConfig:TokenValidityInMinutes")
        );

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiry,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(token);

        return new AuthResponse
        {
            Token = accessToken,
            Email = user.Email,
            Role = user.Role.ToString(),
            ExpiresIn = (int)(expiry - DateTime.UtcNow).TotalSeconds
        };

    }

    public string GenerateToken(int userId, string email, UserRole role)
    {
        var issuer = _configuration["JwtConfig:Issuer"];
        var audience = _configuration["JwtConfig:Audience"];
        var key = _configuration["JwtConfig:Key"];
        var tokenValidityMins = _configuration.GetValue<int>("JwtConfig:TokenValidityInMinutes");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role.ToString())
        }),
            Expires = DateTime.UtcNow.AddMinutes(tokenValidityMins),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
            SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(securityToken);
    }

    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var key = _configuration["JwtConfig:Key"];

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        return principal;
    }

}