"use client"

import React, { useState, useEffect } from 'react';

interface WeatherData {
    temperature: number;
    weathercode: number;
}

export function LocationStatus() {
    const [time, setTime] = useState<string>('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initial time set
        updateTime();

        // Update time every minute
        const timer = setInterval(updateTime, 60000);

        // Fetch weather
        fetchWeather();

        return () => clearInterval(timer);
    }, []);

    const updateTime = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        setTime(now.toLocaleTimeString('en-US', options));
    };

    const fetchWeather = async () => {
        try {
            // Coordinates for Jakarta
            const res = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current_weather=true'
            );
            const data = await res.json();
            setWeather({
                temperature: data.current_weather.temperature,
                weathercode: data.current_weather.weathercode,
            });
        } catch (error) {
            console.error('Failed to fetch weather:', error);
        }
    };

    const getWeatherIcon = (code: number) => {
        // Simple mapping for WMO Weather interpretation codes (WW)
        if (code <= 1) return '☀️';
        if (code <= 3) return 'cloudy'; // Using text/emoji fallback
        if (code <= 48) return '🌫️';
        if (code <= 67) return '🌧️';
        if (code <= 77) return '❄️';
        if (code <= 82) return '🌧️';
        if (code <= 99) return '⛈️';
        return '🌤️';
    };

    if (!mounted) return null;

    return (
        <div className="location-status">
            <p>
                Based in Indonesia 🇮🇩
                <span className="separator"> • </span>
                {time}
                {weather && (
                    <>
                        <span className="separator"> • </span>
                        {getWeatherIcon(weather.weathercode)} {Math.round(weather.temperature)}°C
                    </>
                )}
            </p>
            <style jsx>{`
        .location-status {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin-top: var(--space-lg);
          text-align: center;
        }
        .separator {
          margin: 0 0.5rem;
          opacity: 0.5;
        }
      `}</style>
        </div>
    );
}
