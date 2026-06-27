// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
          <strong className="text-gray-700 dark:text-gray-300">Disclaimer:</strong>{" "}
          This tool is for educational purposes only and does not constitute financial advice.
          Valuation bands shown are general industry conventions based on historical patterns — they are not
          guarantees of future performance, nor are they official standards set by the SEC or any regulatory body.
          Always consult a qualified financial professional before making investment decisions.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Market data provided by{" "}
          <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500 transition-colors">Finnhub</a>
          {" "}· Fallback data by{" "}
          <a href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500 transition-colors">Alpha Vantage</a>
          {" "}· Free tier — data may be delayed or limited.
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 text-center">
          © {new Date().getFullYear()} StockSense AI — Educational use only.
        </p>
      </div>
    </footer>
  );
}
