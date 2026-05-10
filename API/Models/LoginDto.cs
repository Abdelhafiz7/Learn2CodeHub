using System;

namespace API.Models;

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int ExpiresIn { get; internal set; }
}
