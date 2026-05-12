using System.IO.Compression;
using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Enums;
using API.Models;
using API.Services;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController(WebContext context, CloudinaryService cloudinaryService) : ControllerBase
    {
        private readonly CloudinaryService _cloudinaryService = cloudinaryService;


        [HttpGet]
        public async Task<ActionResult<PagedResultDto<Course>>> GetCourses([FromQuery] QueryDto queryDto)
        {
            var query = context.Courses
                .Where(c => c.IsPublished)
                .Include(c => c.Category)
                .Include(c => c.Instructor)
                .Include(c => c.Sections).ThenInclude(s => s.Lessons)
                .Include(c => c.Reviews)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryDto.Search))
            {
                var search = queryDto.Search.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(search));

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim != null)
                {
                    var userId = int.Parse(userIdClaim);

                    var matchedCategory = await context.Categories
                        .FirstOrDefaultAsync(c => c.Name.ToLower().Contains(search));

                    var recentlySarched = await context.UserSearchHistories
                        .AnyAsync(h => h.UserId == userId &&
                                  h.SearchTerm.ToLower() == search &&
                                  h.SearchedAt > DateTime.UtcNow.AddHours(-1));

                    if (!recentlySarched)
                    {
                        context.UserSearchHistories.Add(new UserSearchHistory
                        {
                            UserId = userId,
                            SearchTerm = search,
                            CategoryId = matchedCategory?.Id,
                            SearchedAt = DateTime.UtcNow
                        });

                        await context.SaveChangesAsync();
                    }
                }
            }

            if (queryDto.CategoryId.HasValue)
            {
                query = query.Where(c => c.CategoryId == queryDto.CategoryId.Value);
            }

            if (queryDto.Level.HasValue)
            {
                query = query.Where(c => c.Level == queryDto.Level.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(c => c.Id)
                .Skip((queryDto.Page - 1) * queryDto.PageSize)
                .Take(queryDto.PageSize)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    ShortDescription = c.ShortDescription,
                    Price = c.Price,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Language = c.Language,
                    IsPublished = c.IsPublished,
                    CategoryName = c.Category.Name,
                    Level = c.Level,

                    Instructor = new InstructorDto
                    {
                        Id = c.Instructor.Id,
                        FirstName = c.Instructor.FirstName,
                        LastName = c.Instructor.LastName,
                        ProfileImageUrl = c.Instructor.ProfileImageUrl
                    },

                    TotalLessons = c.Sections
                        .SelectMany(s => s.Lessons)
                        .Count(),

                    TotalDuration = c.Sections
                        .SelectMany(s => s.Lessons)
                        .Sum(l => (int?)l.DurationInMinutes) ?? 0,

                    Rating = c.Reviews.Any()
                        ? c.Reviews.Average(r => r.Rating)
                        : 0,

                    ReviewCount = c.Reviews.Count(),
                    EnrollmentCount = c.Enrollments.Count()
                })
                .ToListAsync();

            var result = new PagedResultDto<CourseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = queryDto.Page,
                PageSize = queryDto.PageSize
            };

            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetCourse(int id)
        {
            var course = await context.Courses
                .Include(c => c.Category)
                .Include(c => c.Instructor)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                .Include(c => c.Reviews)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return NotFound("Course not found");

            var instructor = course.Instructor;

            var instructorReviews = await context.Reviews
                .Where(r => r.Course.InstructorId == instructor.Id)
                .ToListAsync();

            var instructorRating = instructorReviews.Any()
                ? instructorReviews.Average(r => r.Rating)
                : 0;

            var instructorStudents = await context.Enrollments
                .Where(e => e.Course.InstructorId == instructor.Id)
                .CountAsync();

            var totalCourses = await context.Courses
                .CountAsync(c => c.InstructorId == instructor.Id && c.IsPublished);

            var totalReviewers = await context.Reviews
                .Where(r => r.Course.InstructorId == instructor.Id)
                .Select(r => r.UserId)
                .Distinct()
                .CountAsync();

            var enrollments = await context.Enrollments
                .CountAsync(e => e.CourseId == course.Id);

            return Ok(new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                ShortDescription = course.ShortDescription,
                Price = course.Price,
                ThumbnailUrl = course.ThumbnailUrl,
                Language = course.Language,
                CategoryName = course.Category.Name,
                Level = course.Level,
                EnrollmentCount = enrollments,
                updatedAt = course.UpdatedAt,

                Category = new CategoryDto
                {
                    Id = course.Category.Id,
                    Name = course.Category.Name
                },

                Instructor = new InstructorDto
                {
                    Id = course.Instructor.Id,
                    FirstName = course.Instructor.FirstName,
                    LastName = course.Instructor.LastName,
                    Bio = course.Instructor.Bio,
                    ProfileImageUrl = course.Instructor.ProfileImageUrl,
                    Rating = instructorRating,
                    TotalStudents = instructorStudents,
                    TotalCourses = totalCourses,
                    TotalReviewers = totalReviewers
                },

                TotalLessons = course.Sections
                    .SelectMany(s => s.Lessons)
                    .Count(),

                TotalDuration = course.Sections
                    .SelectMany(s => s.Lessons)
                    .Sum(l => (int?)l.DurationInMinutes) ?? 0,

                Rating = course.Reviews.Any()
                    ? course.Reviews.Average(r => r.Rating)
                    : 0,

                ReviewCount = course.Reviews.Count(),

                Sections = course.Sections
                    .OrderBy(s => s.Order)
                    .Select(s => new SectionDto
                    {
                        Id = s.Id,
                        Title = s.Title,
                        Order = s.Order,
                        Lessons = s.Lessons
                            .OrderBy(l => l.Order)
                            .Select(l => new LessonDto
                            {
                                Id = l.Id,
                                Title = l.Title,
                                Content = l.Content,
                                VideoUrl = l.VideoUrl,
                                FileUrl = l.FileUrl,
                                DurationInMinutes = l.DurationInMinutes,
                                IsPreview = l.IsPreview,
                                Order = l.Order
                            })
                            .ToList()
                    })
                    .ToList(),
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult<Course>> CreateCourse(CourseDto courseDto)
        {
            if (string.IsNullOrWhiteSpace(courseDto.Title))
                return BadRequest("Title is required");

            if (string.IsNullOrWhiteSpace(courseDto.Description))
                return BadRequest("Description is required");

            if (courseDto.CategoryId <= 0)
                return BadRequest("Category is required");

            if (courseDto.Price <= 0)
                return BadRequest("Price must be greater than 0");
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var course = new Course
            {
                Title = courseDto.Title,
                Description = courseDto.Description,
                Price = courseDto.Price,
                ThumbnailUrl = courseDto.ThumbnailUrl,
                Language = courseDto.Language,
                CategoryId = courseDto.CategoryId,
                InstructorId = userId,
                Level = courseDto.Level
            };

            context.Courses.Add(course);
            await context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult<Course>> UpdateCourse(int id, CourseDto courseDto)
        {
            var course = await context.Courses.FindAsync(id);
            if (course == null)
                return NotFound("Course not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "You are not allowed to update this course");


            course.Title = courseDto.Title;
            course.Description = courseDto.Description;
            course.ShortDescription = courseDto.ShortDescription;
            course.Price = courseDto.Price;
            course.ThumbnailUrl = courseDto.ThumbnailUrl;
            course.Language = courseDto.Language;
            course.CategoryId = courseDto.CategoryId;
            course.Level = courseDto.Level;
            course.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Ok(course);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult> DeleteCourse(int id)
        {
            var course = await context.Courses.FindAsync(id);
            if (course == null)
                return NotFound("Course not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "You are not allowed to delete this course");

            context.Courses.Remove(course);
            await context.SaveChangesAsync();

            return Ok("Course deleted successfully");
        }

        [HttpGet("{courseId}/progress")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<CourseDto>> GetCourseProgress(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var isEnrolled = await context.Enrollments
                .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (!isEnrolled)
                return BadRequest("You are not enrolled in this course");

            var totalLessons = await context.Lessons
                .Where(l => l.Section.CourseId == courseId)
                .CountAsync();

            if (totalLessons == 0)
            {
                return Ok(new CourseDto
                {
                    CourseId = courseId,
                    TotalLessons = 0,
                    CompletedLessons = 0,
                    Percentage = 0
                });
            }

            var completedLessons = await context.LessonProgresses
                .Where(lp => lp.UserId == userId &&
                             lp.IsCompleted &&
                             lp.Lesson.Section.CourseId == courseId)
                .CountAsync();

            var percentage = Math.Round((double)completedLessons / totalLessons * 100, 2);

            return Ok(new CourseDto
            {
                CourseId = courseId,
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
                Percentage = percentage
            });
        }

        [HttpGet("instructor")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<List<InstructorCourseDto>>> GetInstructorCourses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var courses = await context.Courses
                .Where(c => c.InstructorId == userId)
                .Include(c => c.Category)
                .Include(c => c.Enrollments)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new InstructorCourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Price = c.Price,
                    IsPublished = c.IsPublished,
                    Status = c.Status.ToString(),
                    RejectionReason = c.RejectionReason,
                    EnrollmentCount = c.Enrollments.Count(),
                    CategoryId = c.CategoryId,
                    CategoryName = c.Category.Name,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Level = c.Level,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(courses);
        }

        [HttpPatch("{id}/publish")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult> PublishCourse(int id)
        {
            var course = await context.Courses.FindAsync(id);
            if (course == null) return NotFound("Course not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Not allowed");

            if (role == "Admin")
            {
                course.IsPublished = !course.IsPublished;
                course.Status = course.IsPublished ? CourseStatus.Published : CourseStatus.Draft;
            }
            else
            {
                if (course.Status == CourseStatus.Draft || course.Status == CourseStatus.Rejected)
                {
                    course.Status = CourseStatus.PendingReview;
                }
                else if (course.Status == CourseStatus.PendingReview)
                {
                    course.Status = CourseStatus.Draft;
                }
            }

            course.UpdatedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return Ok(new { message = course.Status.ToString(), status = course.Status.ToString(), isPublished = course.IsPublished });
        }

        [HttpGet("{id}/admin-preview")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CourseDto>> AdminPreviewCourse(int id)
        {
            var course = await context.Courses
                .Include(c => c.Category)
                .Include(c => c.Instructor)
                .Include(c => c.Sections).ThenInclude(s => s.Lessons)
                .Include(c => c.Reviews)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null) return NotFound("Course not found");

            return Ok(new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                ShortDescription = course.ShortDescription,
                Price = course.Price,
                ThumbnailUrl = course.ThumbnailUrl,
                Language = course.Language,
                CategoryName = course.Category.Name,
                Level = course.Level,

                Instructor = new InstructorDto
                {
                    FirstName = course.Instructor.FirstName,
                    LastName = course.Instructor.LastName,
                    Bio = course.Instructor.Bio,
                    ProfileImageUrl = course.Instructor.ProfileImageUrl,
                },

                TotalLessons = course.Sections.SelectMany(s => s.Lessons).Count(),
                TotalDuration = course.Sections.SelectMany(s => s.Lessons)
                    .Sum(l => (int?)l.DurationInMinutes) ?? 0,
                Rating = course.Reviews.Any() ? course.Reviews.Average(r => r.Rating) : 0,
                ReviewCount = course.Reviews.Count(),

                Sections = course.Sections
                    .OrderBy(s => s.Order)
                    .Select(s => new SectionDto
                    {
                        Id = s.Id,
                        Title = s.Title,
                        Order = s.Order,
                        Lessons = s.Lessons.OrderBy(l => l.Order)
                            .Select(l => new LessonDto
                            {
                                Id = l.Id,
                                Title = l.Title,
                                Content = l.Content,
                                VideoUrl = l.VideoUrl,
                                FileUrl = l.FileUrl,
                                DurationInMinutes = l.DurationInMinutes,
                                IsPreview = l.IsPreview,
                                Order = l.Order
                            }).ToList()
                    }).ToList()
            });
        }

        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> ApproveCourse(int id)
        {
            var course = await context.Courses
                .Include(c => c.Category)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return NotFound("Course not found");

            course.Status = CourseStatus.Published;
            course.IsPublished = true;
            course.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Ok(new { message = "Course approved and published successfully" });
        }

        [HttpPatch("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> RejectCourse(int id, [FromBody] string reason)
        {
            var course = await context.Courses
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
                return NotFound("Course not found");

            course.Status = CourseStatus.Rejected;
            course.IsPublished = false;
            course.RejectionReason = reason;
            course.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Ok(new { message = "Course rejected" });
        }


        [HttpGet("{id}/reviews")]
        public async Task<ActionResult<List<ReviewDto>>> GetCourserReviews(int id)
        {
            var reviews = await context.Reviews
                .Where(r => r.CourseId == id)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,

                    User = r.User == null ? null : new UserDto
                    {
                        Id = r.User.Id,
                        FirstName = r.User.FirstName,
                        LastName = r.User.LastName,
                        ProfileImageUrl = r.User.ProfileImageUrl
                    }
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("{id}/related")]
        public async Task<ActionResult<List<CourseDto>>> GetRelatedCourses(int id)
        {
            var course = await context.Courses.FindAsync(id);

            if (course == null)
                return NotFound();

            var related = await context.Courses
                .Where(c => c.CategoryId == course.CategoryId && c.Id != id && c.IsPublished)
                .Include(c => c.Category)
                .Include(c => c.Instructor)
                .OrderByDescending(c => c.Reviews.Count)
                .Take(3)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    ShortDescription = c.ShortDescription,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Level = c.Level,
                    Price = c.Price,
                    CategoryName = c.Category.Name,
                    Instructor = new InstructorDto
                    {
                        Id = c.Instructor.Id,
                        FirstName = c.Instructor.FirstName,
                        LastName = c.Instructor.LastName,
                        ProfileImageUrl = c.Instructor.ProfileImageUrl
                    },
                    TotalLessons = c.Sections.SelectMany(s => s.Lessons).Count(),
                    TotalDuration = c.Sections.SelectMany(s => s.Lessons).Sum(l => (int?)l.DurationInMinutes) ?? 0,
                    Rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = c.Reviews.Count(),
                    EnrollmentCount = c.Enrollments.Count()
                })
                .ToListAsync();

            return Ok(related);
        }

        [HttpGet("recommendations")]
        [Authorize]
        public async Task<ActionResult<List<CourseDto>>> GetRecommendations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrolledIds = await context.Enrollments
                .Where(e => e.UserId == userId)
                .Select(e => e.CourseId)
                .ToListAsync();

            var recentSearches = await context.UserSearchHistories
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.SearchedAt)
                .Take(10)
                .ToListAsync();


            List<CourseDto> recommendations = new();

            if (recentSearches.Any())
            {
                var searchTerms = recentSearches
                    .Select(s => s.SearchTerm.ToLower())
                    .ToList();

                var categoryId = recentSearches
                    .Where(s => s.CategoryId != null)
                    .Select(s => s.CategoryId!.Value)
                    .Distinct()
                    .ToList();

                recommendations = await context.Courses
                    .Where(c => c.IsPublished && !enrolledIds.Contains(c.Id))
                    .Where(c => categoryId.Contains(c.CategoryId) ||
                           searchTerms.Any(term => c.Title.ToLower().Contains(term))
                )

                .Include(c => c.Reviews)
                .Include(c => c.Enrollments)
                .OrderByDescending(c => c.Enrollments.Count)
                .Take(6)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    ShortDescription = c.ShortDescription,
                    ThumbnailUrl = c.ThumbnailUrl,
                    Level = c.Level,
                    Price = c.Price,
                    CategoryName = c.Category.Name,
                    Instructor = new InstructorDto
                    {
                        Id = c.Instructor.Id,
                        FirstName = c.Instructor.FirstName,
                        LastName = c.Instructor.LastName,
                        ProfileImageUrl = c.Instructor.ProfileImageUrl
                    },
                    TotalLessons = c.Sections.SelectMany(s => s.Lessons).Count(),
                    TotalDuration = c.Sections.SelectMany(s => s.Lessons).Sum(l => (int?)l.DurationInMinutes) ?? 0,
                    Rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = c.Reviews.Count(),
                    EnrollmentCount = c.Enrollments.Count()
                })
                .ToListAsync();
            }

            if (!recommendations.Any())
            {
                recommendations = await context.Courses
                    .Where(c => c.IsPublished && !enrolledIds.Contains(c.Id))
                    .Include(c => c.Reviews)
                    .Include(c => c.Enrollments)
                    .OrderByDescending(c => c.Enrollments.Count)
                    .Take(6)
                    .Select(c => new CourseDto
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        ThumbnailUrl = c.ThumbnailUrl,
                        Level = c.Level,
                        Price = c.Price,
                        CategoryName = c.Category.Name,
                        Instructor = new InstructorDto
                        {
                            Id = c.Instructor.Id,
                            FirstName = c.Instructor.FirstName,
                            LastName = c.Instructor.LastName,
                            ProfileImageUrl = c.Instructor.ProfileImageUrl
                        },
                        TotalLessons = c.Sections.SelectMany(s => s.Lessons).Count(),
                        TotalDuration = c.Sections.SelectMany(s => s.Lessons).Sum(l => (int?)l.DurationInMinutes) ?? 0,
                        Rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = c.Reviews.Count(),
                        EnrollmentCount = c.Enrollments.Count()
                    })
                    .ToListAsync();
            }

            return Ok(recommendations);
        }

        [HttpPost("{id}/thumbnail")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult> UploadThumbnail(int id, IFormFile file)
        {
            var course = await context.Courses.FindAsync(id);
            if (course == null)
                return NotFound("Course not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "You are not allowed to upload thumbnail for this course");

            if (file == null || file.Length == 0)
                return BadRequest("No file provided");

            var url = await _cloudinaryService.UploadImageAsync(file);

            return Ok(new { url });
        }

        [HttpPost("upload/image")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided");

            var url = await _cloudinaryService.UploadImageAsync(file);
            return Ok(new { url });
        }

    }
}
