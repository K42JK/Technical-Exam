using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using TechnicalExam.Server.Interface;
using TechnicalExam.Server.Services;
using TechnicalExam.Server.Swagger;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Services.AddControllers();

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
})
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();


builder.Services.AddHttpClient<IEtherscanService, EtherscanService>(client =>
{
    var baseUrl = builder.Configuration["EtherscanApiSettings:BaseUrl"]
                  ?? "https://api.etherscan.io/";
    client.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddHttpClient<IAlchemyService, AlchemyService>(client =>
{
    var url = builder.Configuration["Alchemy:RpcUrl"]!;
    client.BaseAddress = new Uri(url);
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddHttpClient<IAlchemyNftService, AlchemyNftService>(client =>
{
    var apiKey = builder.Configuration["Alchemy:ApiKey"];
    var network = builder.Configuration["Alchemy:Network"];
    client.BaseAddress = new Uri($"https://{network}.g.alchemy.com/nft/v3/{apiKey}/");
    client.Timeout = TimeSpan.FromSeconds(15);
});


builder.Services.AddMemoryCache();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();
    app.UseSwaggerUI(options =>
    {
        foreach (var description in provider.ApiVersionDescriptions)
        {
            options.SwaggerEndpoint(
                $"/swagger/{description.GroupName}/swagger.json",
                $"Technical Exam API {description.ApiVersion}"
            );
        }
    });
}

app.UseHttpsRedirection();

app.MapControllers();
app.MapFallbackToFile("/index.html");
app.Run();