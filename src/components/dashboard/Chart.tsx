"use client";

import { useEffect, useRef } from "react";

interface ChartProps {
    data: Array<{ [key: string]: string | number }>;
    type: "line" | "bar" | "area";
    xKey: string;
    yKey: string;
    color: string;
    height?: number;
    className?: string;
}

export default function Chart({
    data,
    type,
    xKey,
    yKey,
    color,
    height = 200,
    className = "",
}: ChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !data.length) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set up dimensions
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        // Get data ranges
        const xValues = data.map((d) => d[xKey]);
        const yValues = data
            .map((d) => Number(d[yKey]))
            .filter((v) => !isNaN(v));
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const yRange = maxY - minY;

        // Helper function to get x position
        const getX = (index: number) =>
            padding + (index / (data.length - 1)) * chartWidth;

        // Helper function to get y position
        const getY = (value: number) =>
            padding + chartHeight - ((value - minY) / yRange) * chartHeight;

        // Draw axes
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;

        // Y axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.stroke();

        // X axis
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = "#f3f4f6";
        ctx.lineWidth = 0.5;

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }

        // Vertical grid lines
        for (let i = 0; i < data.length; i++) {
            const x = getX(i);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }

        // Draw chart based on type
        if (type === "area") {
            // Fill area
            ctx.fillStyle = color + "20"; // Add transparency
            ctx.beginPath();
            ctx.moveTo(getX(0), padding + chartHeight);

            data.forEach((point, index) => {
                ctx.lineTo(getX(index), getY(Number(point[yKey])));
            });

            ctx.lineTo(getX(data.length - 1), padding + chartHeight);
            ctx.closePath();
            ctx.fill();
        }

        if (type === "line" || type === "area") {
            // Draw line
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((point, index) => {
                const x = getX(index);
                const y = getY(Number(point[yKey]));

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            ctx.fillStyle = color;
            data.forEach((point, index) => {
                const x = getX(index);
                const y = getY(Number(point[yKey]));

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        if (type === "bar") {
            const barWidth = (chartWidth / data.length) * 0.6;
            ctx.fillStyle = color;

            data.forEach((point, index) => {
                const x = getX(index) - barWidth / 2;
                const y = getY(Number(point[yKey]));
                const barHeight = padding + chartHeight - y;

                ctx.fillRect(x, y, barWidth, barHeight);
            });
        }

        // Draw labels
        ctx.fillStyle = "#6b7280";
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "center";

        // X axis labels
        data.forEach((point, index) => {
            const x = getX(index);
            ctx.fillText(String(point[xKey]), x, padding + chartHeight + 20);
        });

        // Y axis labels
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) {
            const value = minY + (i / 5) * yRange;
            const y = padding + chartHeight - (i / 5) * chartHeight;
            ctx.fillText(
                Math.round(value).toLocaleString(),
                padding - 10,
                y + 4
            );
        }
    }, [data, type, xKey, yKey, color, height]);

    return (
        <div className={`w-full ${className}`}>
            <canvas
                ref={canvasRef}
                width={800}
                height={height}
                className="w-full h-auto"
                style={{ maxWidth: "100%" }}
            />
        </div>
    );
}
