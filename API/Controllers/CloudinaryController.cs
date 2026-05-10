using API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Cloudinary : ControllerBase
    {
        private readonly CloudinaryService _cloudinaryService;

        public Cloudinary(CloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("video")]
        public async Task<IActionResult> UploadVideo(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No File");

            var url = await _cloudinaryService.UploadVideoAsync(file);

            return Ok(new { url });
        }

        [HttpPost("file")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file");

            var url = await _cloudinaryService.UploadFileAsync(file);

            return Ok(new { url });
        }
    }

}
