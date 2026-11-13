using Microsoft.OpenApi;
using ZeroFrame.API.Filters;
using ZeroFrame.API.Middleware;
using ZeroFrame.Infra.IoC;
using ZeroFrame.API.Setup;
using ZeroFrame.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Development.local.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ApiErrorResultFilter>();
});
builder.Services.AddScoped<CarrinhoSincronizacaoFilter>();
builder.Services.AddCors(options =>
{
    var configuredFrontendOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? [];

    var allowedFrontendOrigins = new[]
    {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://localhost:3090"
    }.Concat(configuredFrontendOrigins)
        .Where(origin => !string.IsNullOrWhiteSpace(origin))
        .ToArray();

    options.AddPolicy(name: "ZeroFrame_Frontend",
        policy =>
        {
            policy.SetIsOriginAllowed(origin =>
                    origin == "null"
                    || allowedFrontendOrigins.Contains(origin)
                    || Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                        && (uri.Host == "localhost" || uri.Host == "127.0.0.1"))
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Insira o token JWT no formato: Bearer {seu_token}"
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", null, "Bearer"),
            new List<string>()
        }
    });
});
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (args.Contains("--atualizar-banco") || args.Contains("--verificar-banco") || args.Contains("--catalogo-demo"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var banco = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (args.Contains("--atualizar-banco")) await banco.Database.MigrateAsync();
    if (args.Contains("--catalogo-demo")) await CatalogoDemo.CarregarAsync(banco);
    if (args.Contains("--verificar-banco")) await AuditoriaBanco.VerificarAsync(banco);
    return;
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ZeroFrame_Frontend");
app.UseExceptionMiddleware();

if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "../../mobile/assets/images/produtos"))),
    RequestPath = "/catalogo-demo"
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "../../FRONTEND"))),
    RequestPath = "/desktop"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/health", async (ApplicationDbContext banco) =>
    await banco.Database.CanConnectAsync()
        ? Results.Ok(new { status = "ok", banco = "SQL Server" })
        : Results.Problem("O banco de dados está indisponível.", statusCode: 503));

app.Run();
