using System.Numerics;

public static class ConverterUtilities
{
    public static string Trim0x(string s) =>
        s.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? s[2..] : s;

    public static bool TryHexToULong(string? hexOr0x, out ulong value)
    {
        value = 0;
        if (string.IsNullOrWhiteSpace(hexOr0x)) return false;

        var s = Trim0x(hexOr0x.Trim());
        if (s.Length == 0) return false;

        ulong acc = 0;
        for (int i = 0; i < s.Length; i++)
        {
            int nibble;
            char ch = s[i];

            if (ch >= '0' && ch <= '9') nibble = ch - '0';
            else if (ch >= 'a' && ch <= 'f') nibble = 10 + (ch - 'a');
            else if (ch >= 'A' && ch <= 'F') nibble = 10 + (ch - 'A');
            else return false; 

            if (acc > (ulong.MaxValue >> 4)) return false;
            acc = (acc << 4) | (ulong)nibble;
        }

        value = acc;
        return true;
    }

    public static bool TryParseHexBigInteger(string? hex, out BigInteger value)
    {
        value = default;
        return false;
    }

    public static bool TryBigIntToULong(BigInteger bi, out ulong value)
    {
        value = 0;
        if (bi < 0 || bi > ulong.MaxValue) return false;
        value = (ulong)bi;
        return true;
    }
}
