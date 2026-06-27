"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp
} from "lightweight-charts";
import { Candle, Token, formatNumber, formatUsd } from "@/lib/tokens";

type Props = {
  token: Token;
};

type CandlePoint = CandlestickData<UTCTimestamp> & {
  volume: number;
};

type CandleSeriesApi = ISeriesApi<"Candlestick">;
type VolumeSeriesApi = ISeriesApi<"Histogram">;

const intervals = ["1m", "5m", "15m", "1H", "4H", "1D"] as const;

type ChartInterval = (typeof intervals)[number];

type MarketResponse = {
  configured: boolean;
  candles: Candle[];
  error?: string;
};

export function TradingViewChart({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<CandleSeriesApi | null>(null);
  const volumeSeriesRef = useRef<VolumeSeriesApi | null>(null);
  const [activeInterval, setActiveInterval] = useState<ChartInterval>("1H");
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [marketStatus, setMarketStatus] = useState<"loading" | "ready" | "empty" | "unconfigured" | "error">("loading");
  const [marketError, setMarketError] = useState("");
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? latest;
  const latestUp = latest ? latest.close >= latest.open : true;
  const volumeData = useMemo<HistogramData<UTCTimestamp>[]>(
    () =>
      candles.map((candle) => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? "rgba(68,245,157,.34)" : "rgba(248,113,113,.34)"
      })),
    [candles]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadCandles() {
      if (!token.mint) {
        setCandles([]);
        setMarketStatus("empty");
        setMarketError("No live token address returned for this market.");
        return;
      }

      setMarketStatus("loading");
      setMarketError("");

      try {
        const response = await fetch(`/api/market?address=${encodeURIComponent(token.mint)}&interval=${activeInterval}`, {
          signal: controller.signal
        });
        const data = (await response.json()) as MarketResponse;

        if (!response.ok) {
          throw new Error(data.error ?? "Market data unavailable");
        }

        if (!data.configured) {
          setCandles([]);
          setMarketStatus("unconfigured");
          return;
        }

        const nextCandles = data.candles.map((candle) => ({
          time: candle.time as UTCTimestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }));

        setCandles(nextCandles);
        setMarketStatus(nextCandles.length > 0 ? "ready" : "empty");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setCandles([]);
        setMarketStatus("error");
        setMarketError(error instanceof Error ? error.message : "Market data unavailable");
      }
    }

    loadCandles();

    return () => {
      controller.abort();
    };
  }, [activeInterval, token.mint]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,.58)",
        fontFamily: "Inter, ui-sans-serif, system-ui"
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,.055)" },
        horzLines: { color: "rgba(255,255,255,.055)" }
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "rgba(184,255,66,.35)", labelBackgroundColor: "#10261d" },
        horzLine: { color: "rgba(184,255,66,.35)", labelBackgroundColor: "#10261d" }
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,.10)",
        scaleMargins: { top: 0.08, bottom: 0.24 }
      },
      timeScale: {
        borderColor: "rgba(255,255,255,.10)",
        timeVisible: true,
        secondsVisible: false
      },
      localization: {
        priceFormatter: (price: number) => formatUsd(price)
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#44f59d",
      downColor: "#f87171",
      borderUpColor: "#44f59d",
      borderDownColor: "#f87171",
      wickUpColor: "#44f59d",
      wickDownColor: "#f87171",
      priceFormat: {
        type: "price",
        precision: token.price < 0.01 ? 8 : token.price < 1 ? 5 : 2,
        minMove: token.price < 0.01 ? 0.00000001 : token.price < 1 ? 0.00001 : 0.01
      }
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      base: 0,
      lastValueVisible: false,
      priceLineVisible: false
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [token.price]);

  useEffect(() => {
    candleSeriesRef.current?.setData(candles);
    volumeSeriesRef.current?.setData(volumeData);
    if (candles.length > 0) {
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles, volumeData]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#050806]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {intervals.map((interval) => (
            <button
              className={`h-8 rounded-md px-2.5 text-xs font-semibold transition ${
                interval === activeInterval ? "bg-acid text-ink" : "text-white/52 hover:bg-white/[0.08] hover:text-white"
              }`}
              key={interval}
              onClick={() => setActiveInterval(interval)}
              aria-pressed={interval === activeInterval}
              type="button"
            >
              {interval}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/52">
          <span>Vol {latest ? formatUsd(latest.volume) : "-"}</span>
          <span>24h {formatNumber(token.volume24h)}</span>
        </div>
      </div>
      {latest ? (
        <div className="grid grid-cols-2 gap-2 border-b border-white/10 px-3 py-2 text-xs sm:flex sm:items-center sm:gap-5">
          <span className="text-white/52">
            O <span className="font-semibold text-white">{formatUsd(latest.open)}</span>
          </span>
          <span className="text-white/52">
            H <span className="font-semibold text-mint">{formatUsd(latest.high)}</span>
          </span>
          <span className="text-white/52">
            L <span className="font-semibold text-red-300">{formatUsd(latest.low)}</span>
          </span>
          <span className="text-white/52">
            C <span className={latestUp ? "font-semibold text-mint" : "font-semibold text-red-300"}>{formatUsd(latest.close)}</span>
          </span>
          <span className={previous && latest.close >= previous.close ? "font-semibold text-mint" : "font-semibold text-red-300"}>
            {previous && latest.close >= previous.close ? "+" : ""}
            {previous ? (((latest.close - previous.close) / previous.close) * 100).toFixed(2) : "0.00"}%
          </span>
        </div>
      ) : null}
      <div className="relative h-[560px] min-h-[360px] w-full">
        <div className="absolute inset-0" ref={containerRef} />
        {marketStatus !== "ready" ? (
          <div className="absolute inset-0 grid place-items-center bg-[#050806]/88 p-6 text-center">
            <div>
              <p className="text-sm font-semibold text-white">
                {marketStatus === "loading"
                  ? "Loading market data"
                  : marketStatus === "unconfigured"
                    ? "Birdeye API key required"
                    : marketStatus === "empty"
                      ? "No OHLCV data returned"
                      : "Market data unavailable"}
              </p>
              <p className="mt-2 max-w-sm text-sm text-white/48">
                {marketStatus === "unconfigured"
                  ? "Set BIRDEYE_API_KEY on the server to show real Solana token candles."
                  : marketError || "The chart will populate when the provider returns candles for this token."}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
