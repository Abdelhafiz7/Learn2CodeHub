using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixUserDeleteRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_LessonNotes_UserId",
                table: "LessonNotes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LessonNotes_Users_UserId",
                table: "LessonNotes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LessonNotes_Users_UserId",
                table: "LessonNotes");

            migrationBuilder.DropIndex(
                name: "IX_LessonNotes_UserId",
                table: "LessonNotes");
        }
    }
}
