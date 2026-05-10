using API.Entities;
using API.Enums;
using API.Services;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DbInitializer
{
    public static void InitDb(WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<WebContext>()
            ?? throw new InvalidOperationException("Failed to get WebContext.");

        SeedData(context);
    }

    private static void SeedData(WebContext context)
    {
        context.Database.Migrate();

        if (context.Courses.Any()) return;

        var passwordService = new PasswordService();

        var instructor = new User
        {
            FirstName = "Test1",
            LastName = "Instructor",
            Email = "instructor11@test.com",
            PasswordHash = passwordService.HashPassword("test"),
            Role = UserRole.Instructor
        };

        context.Users.Add(instructor);

        var admin = new User
        {
            FirstName = "Abdelhafiz",
            LastName = "Saleh",
            Email = "3bdul7afiz@gmail.com",
            PasswordHash = passwordService.HashPassword("admin123"),
            Role = UserRole.Admin
        };

        context.Users.Add(admin);

        var category = new Category
        {
            Name = "Programming",
            Description = "Programming Courses"
        };

        context.Categories.Add(category);

        context.SaveChanges();

        var courses = new List<Course>
        {
            new()
            {
                Title = "Course 1",
                Description = "Description for Course 1",
                Price = 100,
                ThumbnailUrl = "https://example.com/course1.jpg",
                CategoryId = category.Id,
                InstructorId = instructor.Id,
                IsPublished = true
            },
            new()
            {
                Title = "Course 2",
                Description = "Description for Course 2",
                Price = 150,
                ThumbnailUrl = "https://example.com/course2.jpg",
                CategoryId = category.Id,
                InstructorId = instructor.Id,
                IsPublished = true
            },
            new()
            {
                Title = "Course 3",
                Description = "Description for Course 3",
                Price = 200,
                ThumbnailUrl = "https://example.com/course3.jpg",
                CategoryId = category.Id,
                InstructorId = instructor.Id,
                IsPublished = true
            }
        };

        context.Courses.AddRange(courses);
        context.SaveChanges();
    }
}