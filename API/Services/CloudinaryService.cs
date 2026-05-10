using System;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace API.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var cloudName = config["Cloudinary:CloudName"];
        var apiKey = config["Cloudinary:ApiKey"];
        var apiSecret = config["Cloudinary:ApiSecret"];

        Console.WriteLine($"CloudName: {cloudName}");
        Console.WriteLine($"ApiKey: {apiKey}");
        Console.WriteLine($"ApiSecret: {apiSecret}");

        if (string.IsNullOrEmpty(cloudName) ||
            string.IsNullOrEmpty(apiKey) ||
            string.IsNullOrEmpty(apiSecret))
        {
            throw new Exception("❌ Cloudinary config is missing");
        }

        var acc = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(acc);
    }

    public async Task<string> UploadVideoAsync(IFormFile file)
    {
        await using var stream = file.OpenReadStream();

        var uploadParams = new VideoUploadParams
        {
            File = new FileDescription(file.FileName, stream)
        };

        var result = await _cloudinary.UploadLargeAsync(uploadParams);

        return result.SecureUrl.ToString();
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new Exception("File is empty");

        await using var stream = file.OpenReadStream();

        var uploadParams = new RawUploadParams
        {
            File = new FileDescription(file.FileName, stream)
        };

        var result = await _cloudinary.UploadLargeAsync(uploadParams);

        if (result?.SecureUrl == null)
            throw new Exception("Upload failed");

        return result.SecureUrl.ToString();
    }
}
