FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["API.csproj", "./"]
RUN dotnet restore "API.csproj"
COPY . .
RUN dotnet build "API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
RUN mkdir -p /app/db && chmod 777 /app/db
COPY --from=publish /app/publish .
COPY LearnToCode.db /app/db/LearnToCode.db
ENTRYPOINT ["dotnet", "API.dll"]