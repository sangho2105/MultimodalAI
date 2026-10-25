using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Data;
using MultimodalAI_API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký Gemini Vision Service với HttpClient (R4)
builder.Services.AddHttpClient<IGeminiVisionService, GeminiVisionService>();

builder.Services.AddControllers();

// Cấu hình CORS cho phép React Frontend kết nối
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

// Cho phép phục vụ file tĩnh từ wwwroot (R3 - Static File Management)
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();
