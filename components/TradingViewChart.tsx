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
import { Token, formatNumber, formatUsd } from "@/lib/tokens";

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

const intervalSettings: Record<ChartInterval, { seconds: number; windowStart: number; swing: number; frequency: number }> = {
  "1m": { seconds: 60, windowStart: 0.82, swing: 0.45, frequency: 2.9 },
  "5m": { seconds: 5 * 60, windowStart: 0.68, swing: 0.65, frequency: 2.35 },
  "15m": { seconds: 15 * 60, windowStart: 0.52, swing: 0.82, frequency: 1.95 },
  "1H": { seconds: 60 * 60, windowStart: 0.32, swing: 1, frequency: 1.7 },
  "4H": { seconds: 4 * 60 * 60, windowStart: 0.14, swing: 1.2, frequency: 1.28 },
  "1D": { seconds: 24 * 60 * 60, windowStart: 0, swing: 1.45, frequency: 0.86 }
};

function tokenSeed(token: Token) {
  return token.symbol.split("").reduce((seed, char) => seed + char.charCodeAt(0), 0);
}

function interpolate(values: number[], position: number) {
  const leftIndex = Math.floor(position);
  const rightIndex = Math.min(values.length - 1, leftIndex + 1);
  const progress = position - leftIndex;
  return values[leftIndex] + (values[rightIndex] - values[leftIndex]) * progress;
}

function createCandles(token: Token, interval: ChartInterval): CandlePoint[] {
  const candleCount = 64;
  const settings = intervalSettings[interval];
  const step = settings.seconds;
  const now = Math.floor(Math.floor(Date.now() / 1000) / step) * step;
  const start = now - candleCount * step;
  const seed = tokenSeed(token);

  return Array.from({ length: candleCount }, (_, index) => {
    const progress = index / (candleCount - 1);
    const position = (settings.windowStart + progress * (1 - settings.windowStart)) * (token.sparkline.length - 1);
    const base = interpolate(token.sparkline, position);
    const previousProgress = Math.max(0, index - 1) / (candleCount - 1);
    const previousPosition = (settings.windowStart + previousProgress * (1 - settings.windowStart)) * (token.sparkline.length - 1);
    const previous = index === 0 ? base : interpolate(token.sparkline, previousPosition);
    const swing = (Math.sin((index + seed) * settings.frequency) * 0.012 + Math.cos((index + seed) * settings.frequency * 0.37) * 0.008) * settings.swing;
    const open = Math.max(0.000001, previous * (1 - swing * 0.35));
    const close = Math.max(0.000001, base * (1 + swing * 0.25));
    const wick = Math.max(open, close) * (0.008 + Math.abs(Math.sin(index + seed)) * 0.018);
    const volumeWave = 0.55 + Math.abs(Math.sin(index * 0.48 + seed)) * 0.9;

    return {
      time: (start + index * step) as UTCTimestamp,
      open,
      high: Math.max(open, close) + wick,
      low: Math.max(0.000001, Math.min(open, close) - wick),
      close,
      volume: Math.round(token.volume24h * (step / (24 * 60 * 60)) * volumeWave)
    };
  });
}

export function TradingViewChart({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<CandleSeriesApi | null>(null);
  const volumeSeriesRef = useRef<VolumeSeriesApi | null>(null);
  const [activeInterval, setActiveInterval] = useState<ChartInterval>("1H");
  const candles = useMemo(() => createCandles(token, activeInterval), [activeInterval, token]);
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? latest;
  const latestUp = latest.close >= latest.open;
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
    chartRef.current?.timeScale().fitContent();
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
          <span>Vol {formatUsd(latest.volume)}</span>
          <span>24h {formatNumber(token.volume24h)}</span>
        </div>
      </div>
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
        <span className={latest.close >= previous.close ? "font-semibold text-mint" : "font-semibold text-red-300"}>
          {latest.close >= previous.close ? "+" : ""}
          {(((latest.close - previous.close) / previous.close) * 100).toFixed(2)}%
        </span>
      </div>
      <div className="h-[560px] min-h-[360px] w-full" ref={containerRef} />
    </div>
  );
}
