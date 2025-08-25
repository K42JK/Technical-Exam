using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;
using TechnicalExam.Server.DTO.Response;

namespace TechnicalExam.Server.Utilities
{
    public static class CacheUtilities
    {
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> Locks = new();
        private static readonly Random Rng = new();

        public static TimeSpan WithJitter(TimeSpan ttl, int pct = 20)
        {
            var ms = (int)ttl.TotalMilliseconds;
            var jitter = Rng.Next(-(ms * pct / 100), (ms * pct / 100) + 1);
            return TimeSpan.FromMilliseconds(Math.Max(500, ms + jitter));
        }


        public static async Task<ApiResponse<T>> GetWithCacheAsync<T>(
            IMemoryCache cache,
            string key,
            TimeSpan ttl,
            Func<Task<ApiResponse<T>>> fetch,
            CancellationToken ct = default)
        {
            if (cache.TryGetValue(key, out T cached))
                return new ApiResponse<T>("1", "OK (cache)", cached);

            var gate = Locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
            await gate.WaitAsync(ct);
            try
            {
                if (cache.TryGetValue(key, out cached))
                    return new ApiResponse<T>("1", "OK (cache)", cached);

                var res = await fetch();

                if (res.Status == "1" && res.Result is not null)
                    cache.Set(key, res.Result, WithJitter(ttl));

                return res;
            }
            finally
            {
                gate.Release();
            }
        }
    }
}
