using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Experimental.ProjectCache;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController(WebContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<PagedResultDto<CategoryDto>>> GetCategories([FromQuery] QueryDto queryDto)
        {
            var page = queryDto.Page <= 0 ? 1 : queryDto.Page;
            var pageSize = queryDto.PageSize <= 0 ? 10 : queryDto.PageSize;

            var query = context.Categories
                .Include(c => c.Courses)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryDto.Search))
            {
                var search = queryDto.Search.Trim().ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Icon = c.Icon,
                    CourseCount = c.Courses.Count()
                })
                .ToListAsync();

            return Ok(new PagedResultDto<CategoryDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await context.Categories.FindAsync(id);
            if (category == null) return NotFound();
            return category;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Category>> CreateCategory(CategoryDto categoryDto)
        {
            var category = new Category
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                Icon = categoryDto.Icon
            };

            context.Categories.Add(category);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Category>> UpdateCategory(int id, CategoryDto categoryDto)
        {
            var category = await context.Categories.FindAsync(id);
            if (category == null)
                return NotFound("Category not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (role != "Admin")
                return StatusCode(403, "Only admin can update categories");

            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            category.Icon = categoryDto.Icon;
            category.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var category = await context.Categories.FindAsync(id);
            if (category == null)
                return NotFound("Category not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (role != "Admin")
                return StatusCode(403, "Only admin can Delete categories");

            context.Categories.Remove(category);
            await context.SaveChangesAsync();

            return Ok("Category deleted successfully");
        }

        [HttpGet("{id}/related")]
        public async Task<ActionResult<List<CategoryDto>>> GetRelatedCategories(int id)
        {
            var currentCourses = await context.Courses
                .Where(c => c.CategoryId == id)
                .ToListAsync();

            if (!currentCourses.Any())
                return Ok(new List<CategoryDto>());

            var levels = currentCourses
                .Select(c => c.Level)
                .Distinct()
                .ToList();

            var relatedCategories = await context.Categories
                .Include(c => c.Courses)
                .Where(c => c.Id != id)
                .Where(c => c.Courses.Any(course => levels.Contains(course.Level)))
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Icon = c.Icon,
                    CourseCount = c.Courses.Count()
                })
                .Take(6)
                .ToListAsync();

            return Ok(relatedCategories);
        }

    }
}

